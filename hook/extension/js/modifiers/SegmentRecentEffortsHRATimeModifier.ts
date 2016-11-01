class SegmentRecentEffortsHRATimeModifier implements IModifier {

    protected userSettings: IUserSettings;
    protected athleteId: number;
    protected segmentId: number;
    protected hraTimeLoop: number;


    constructor(userSettings: IUserSettings, athleteId: number, segmentId: number) {
        this.userSettings = userSettings;
        this.athleteId = athleteId;
        this.segmentId = segmentId;
    }


    public modify(): void {

        if (this.userSettings.displayRecentEffortsHRAdjustedPacePower) {
            this.hraTimeLoop = setInterval(() => {
                this.hraTime();
            }, 750);
        }

    }

    protected findCurrentSegmentEfforts(segmentId: number, page?: number, deferred?: JQueryDeferred<Array<EffortInfo>>, fetchedLeaderBoardData?: Array<EffortInfo>): JQueryPromise<Array<EffortInfo>> {

        if (!page) {
            page = 1;
        }
        if (!deferred) {
            deferred = $.Deferred();
        }
        if (!fetchedLeaderBoardData) {
            fetchedLeaderBoardData = [];
        }

        let perPage: number = 50;

        let jqxhr: JQueryXHR = $.getJSON('/segments/' + segmentId + '/leaderboard?raw=true&page=' + page + '&per_page=' + perPage + '&viewer_context=false&filter=my_results');

        jqxhr.done((leaderBoardData: LeaderBoardData) => {

            // Make any recursive leaderboardData fetched flatten with previous one
            fetchedLeaderBoardData = _.flatten(_.union(leaderBoardData.top_results, fetchedLeaderBoardData));

            if (leaderBoardData.top_results.length == 0) {
                deferred.resolve(fetchedLeaderBoardData);
            } else { // Not yet resolved then seek recursive on next page
                this.findCurrentSegmentEfforts(segmentId, page + 1, deferred, fetchedLeaderBoardData);
            }

        }).fail((error: any) => {
            deferred.reject(error);
        });

        return deferred.promise();
    }

    protected hraTime(): void {

        function createElementSVG(kind: string, ...attribs: string[][]): SVGElement {
            let ret = document.createElementNS("http://www.w3.org/2000/svg", kind);
            for (let attrib of attribs) {
                ret.setAttribute(attrib[0], attrib[1])
            }
            return ret;
        }

        function createChildElementSVG(parent: Node, kind: string, ...attribs: string[][]): SVGElement {
            let ch = createElementSVG(kind, ...attribs);
            parent.appendChild(ch);
            return ch;
        }

        let recentEffortsChart: JQuery = $("#athlete-history-chart");

        if (!recentEffortsChart.hasClass("stravistiXGraph")) {

            recentEffortsChart.addClass("stravistiXGraph");

            let chart = recentEffortsChart.find("svg");

            let marks = chart.find("circle").filter(".mark");

            interface XY {x: number; y: number}

            const xyFromMark = function(m: any): XY {
                return {"x": m.cx.baseVal.value, "y": m.cy.baseVal.value};
            };

            // scan area used by the effort marks
            let maxY: number, minY: number;
            let minX: number, maxX: number;
            marks.each((i, m) => {
                let xy = xyFromMark(m);
                minY = Helper.safeMin(minY, xy.y);
                maxY = Helper.safeMax(maxY, xy.y);
                minX = Helper.safeMin(minX, xy.x);
                maxX = Helper.safeMax(maxX, xy.x);
            });

            this.findCurrentSegmentEfforts(this.segmentId).then((fetchedLeaderBoardData: Array<EffortInfo>) => {
                // data come sorted by elapsed time, fastest first - we need them sorted by date

                fetchedLeaderBoardData = fetchedLeaderBoardData.sort((left, right) => {
                    let lDate = new Date(left.start_date_local_raw);
                    let rDate = new Date(right.start_date_local_raw);
                    return lDate.getTime() - rDate.getTime();
                });

                // if there are more data than marks, assume oldest marks are dropped
                if (marks.length < fetchedLeaderBoardData.length) {
                    fetchedLeaderBoardData = fetchedLeaderBoardData.splice(-marks.length, marks.length);
                }

                // when watts are present, show watts, not time (used for bike activities)
                let showWatts = true;
                fetchedLeaderBoardData.forEach((r) => {
                    // detection based only on single avg_watts != null seems unreliable, I have seen a run effort with avg_watts present
                    if (r.avg_watts == null) {
                        showWatts = false;
                    }
                });


                let minHR: number = null, maxHR: number = null;
                fetchedLeaderBoardData.forEach((r) => {
                    minHR = Helper.safeMin(minHR, r.avg_heart_rate);
                    maxHR = Helper.safeMax(maxHR, r.avg_heart_rate);
                });

                let restHR = this.userSettings.userRestHr;
                let targetHR = maxHR;

                class HRValueComputed {
                    effort: EffortInfo;
                    hraValue: number;

                    constructor(effort: EffortInfo, hraValue?: number) {
                        this.effort = effort;
                        this.hraValue = hraValue;
                    }
                }

                let hrValuesComputed = fetchedLeaderBoardData.map ((r: EffortInfo) => {
                    if (r.avg_heart_rate != null && r.avg_heart_rate > restHR) {
                        let mValue = showWatts ? r.avg_watts : r.elapsed_time_raw;

                        let ratio = (r.avg_heart_rate - restHR) / (targetHR - restHR);
                        return new HRValueComputed(r, showWatts ? mValue / ratio : mValue * ratio);
                    } else return new HRValueComputed(r);
                });

                let hrValues = hrValuesComputed.filter((h: HRValueComputed) => h.hraValue != null).length;

                if (hrValues > 1) {

                    let fastestValue: number = null;
                    let slowestValue: number = null;

                    if (showWatts) {
                        hrValuesComputed.forEach((r: HRValueComputed) => {
                            let rValue: number = r.hraValue;
                            if (rValue != null) {
                                fastestValue = Helper.safeMax(fastestValue, rValue); // high power -> fast
                                slowestValue = Helper.safeMin(slowestValue, rValue);
                            }
                        });
                    } else {
                        fetchedLeaderBoardData.forEach((r: EffortInfo) => {
                            let rValue: number = r.elapsed_time_raw;
                            fastestValue = Helper.safeMin(fastestValue, rValue); // high time -> slow
                            slowestValue = Helper.safeMax(slowestValue, rValue);
                        });
                    }


                    if (showWatts) {
                        // avoid watt range too sensitive, would result in meaningless wild data
                        let minWattRange = 100;
                        let wattRange = fastestValue - slowestValue;
                        if (wattRange < minWattRange) {
                            slowestValue -= (minWattRange - wattRange) / 2;
                            if (slowestValue < 0) {
                                slowestValue = 0;
                            }
                            fastestValue = slowestValue + minWattRange;
                        }
                    }

                    let topY = 10;
                    let bottomY = parseInt(chart[0].getAttribute("height")) - 10;

                    let slowY = maxY;
                    let fastY = minY;

                    if (showWatts) {
                        // scan Y-axis (time) to check for the reasonable vertical range to use
                        let translateRegEx: RegExp = /translate\((.*),(.*)\)/;
                        let yAxis = chart.find(".y.axis"); //<g class="y axis" transform="translate(-27.45, 0)">
                        let ticks = yAxis.find(".tick");

                        let ticksY = <Array<number>> ticks.map((index: number, domElement: Element) => {
                            let tickText = $(domElement).attr("transform");
                            let yTick = translateRegEx.exec(tickText)[2];
                            return parseFloat(yTick);
                        }).valueOf();

                        let yTickTop = ticksY[0];
                        let yTickBot = ticksY[ticksY.length - 1];
                        slowY = yTickTop + (yTickBot - yTickTop) * 0.25;
                        fastY = yTickBot - (yTickBot - yTickTop) * 0.2;

                        // produce a few watt labels
                        let step = 25;
                        if (fastestValue - slowestValue >= 400) {
                            step = 100;
                        } else if (fastestValue - slowestValue >= 200) {
                            step = 50;
                        }
                        let roundFastestDown = Math.floor(fastestValue / step) * step;
                        let roundSlowestUp = Math.ceil(slowestValue / step) * step;

                        let wattMarks: Array<number> = [];
                        for (let mWatts = roundSlowestUp; mWatts <= roundFastestDown + 1; mWatts += step) {
                            wattMarks.push(mWatts);
                        }

                        let wattAxisX = maxX;

                        let gAxis = createElementSVG("g",
                            ["class", "y axis"],
                            ["style", "opacity: 1;"],
                            ["transform", "translate(" + wattAxisX + ", 0)"]);

                        wattMarks.forEach((mWatts: number) => {
                            let f = ( mWatts - fastestValue) / (slowestValue - fastestValue);
                            let mY = f * (slowY - fastY) + fastY;

                            let g = createChildElementSVG(gAxis, "g",
                                ["class", "tick"],
                                ["style", "opacity: 1;"],
                                ["transform", "translate(0," + mY.toFixed(0) + ")"]);

                            createChildElementSVG(g, "line",
                                ["x2", "0"],
                                ["y2", "0"],
                                ["class", "grid"]);

                            let text = createChildElementSVG(g, "text",
                                ["x", "50"], // TODO: copy from y axis markers
                                ["y", "0"],
                                ["dy", ".32em"],
                                ["class", "hra-axis axis-tick-text"],
                                ["style", "text-anchor: end;"]);
                            text.textContent = mWatts.toFixed(0) + " W";

                        });

                        let insertDOM = chart.find(".y.axis").eq(0);

                        insertDOM.before(gAxis);
                    }


                    const mapValueToY = function(value: number): number {
                        return (value - fastestValue) / (slowestValue - fastestValue) * (slowY - fastY) + fastY;
                    };

                    const clampY = function(resY: number): number {
                        return Math.min(Math.max(topY, resY), bottomY);
                    };

                    // compute values for marks with HR data
                    let markData = <Array<Array<number>>> marks.map((i, m) => {
                        let xy = xyFromMark(m);

                        let hraValue = hrValuesComputed[i].hraValue;

                        if (hraValue != null) {
                            let resY = mapValueToY(hraValue);
                            return [[i, m, resY, hraValue, xy.x]];
                        }
                    }).valueOf();

                    // create the SVG marks
                    let mappedMarks = $.map(markData, (imr) => {
                        let [, , resY, hraValue, mx] = imr;

                        let clampedY = clampY(resY);

                        // Cannot create SVG as HTML source - see http://stackoverflow.com/a/6149687/16673
                        let mark = createElementSVG("circle",
                            ["class", "hra-time-mark mark"],
                            ["cx", mx.toString()],
                            ["cy", clampedY.toString()],
                            ["r", "3"]);

                        if (resY < topY || resY > bottomY) {
                            let title = createElementSVG("text",
                                ["x", (mx + 4).toString()],
                                ["y", (clampedY + 4).toString()],
                                ["class", "axis-tick-text"]);
                            title.textContent = showWatts ? hraValue.toFixed(0) : Helper.secondsToHHMMSS(hraValue, true);
                            return [mark, title];
                        }

                        return mark;

                    });

                    // create the SVG lines connecting the marks
                    let lines: Array<SVGElement> = [];
                    let infobox: SVGElement = null;

                    for (let i = 1; i < markData.length; i++) {
                        let imrPrev = markData[i - 1];
                        let imrNext = markData[i];
                        let line = createElementSVG("line",
                            ["class", "hra-line"],
                            ["x1", imrPrev[4].toString()],
                            ["y1", clampY(imrPrev[2]).toString()],
                            ["x2", imrNext[4].toString()],
                            ["y2", clampY(imrNext[2]).toString()]);

                        lines.push(line);
                    }


                    if (lines.length>0) {
                        let lastLine = lines[lines.length-1];

                        let pbLabel = chart.find(".personal-best-label");
                        let pbValue = chart.find(".personal-best-value");

                        let pbLabelBox = (<SVGLocatable><any>pbLabel[0]).getBBox();
                        let pbLabelValue = (<SVGLocatable><any>pbValue[0]).getBBox();

                        let pbTop = Math.min(pbLabelBox.y, pbLabelValue.y);
                        let pbBot = Math.max(pbLabelBox.y + pbLabelBox.height, pbLabelValue.y + pbLabelValue.height);

                        let lastHRAY = parseFloat(lastLine.getAttribute("y2"));

                        let hoverW = 14;
                        let hoverH = 14;
                        let hoverX = 20;
                        let hoverY = -hoverH/2;

                        let infoY = lastHRAY;

                        if (infoY + hoverH / 2 < pbTop ) {} // infobox above the PB top
                        else if (infoY - hoverH / 2 > pbBot) {} // infobox below the PB bottom
                        else {
                            // infobox colliding with the PB info
                            // move it up or down, whichever is closer
                            if (infoY < (pbTop + pbBot) / 2) infoY = pbTop - hoverH / 2;
                            else infoY = pbBot + hoverH / 2;
                        }

                        let boxX = parseFloat(pbLabel.attr("x"));

                        let line = createElementSVG("line",
                            ["class", "hra-line"],
                            ["x1", lastLine.getAttribute("x2")],
                            ["y1", lastHRAY.toString()],
                            ["x2", (boxX - 3).toString()],
                            ["y2", infoY.toString()]);

                        lines.push(line);

                        infobox = createElementSVG("g", ["transform", "translate(" + boxX.toString() + ", " + infoY.toString() + ")"]);


                        {
                            let infoboxValue = createChildElementSVG(infobox, "text",
                                ["id", "hra-value"],
                                ["x", "0"],
                                ["y", (hoverY + hoverH / 2).toString()]);
                            infoboxValue.textContent = maxHR.toFixed();
                        }


                        {
                            createChildElementSVG(infobox, "rect",
                                ["id", "hra-box-help"],
                                ["x", hoverX.toString()],
                                ["y", hoverY.toString()],
                                ["width", hoverW.toString()],
                                ["height", hoverH.toString()]);

                            let infoboxHelp = createChildElementSVG(infobox, "text",
                                ["id", "hra-value-help"],
                                ["x", (hoverX + hoverW / 2).toString()],
                                ["y", (hoverY + hoverH / 2).toString()]);
                            infoboxHelp.textContent = "?";
                        }

                        let infoboxHoverG = createChildElementSVG(infobox, "g", ["id", "hra-hover"]);

                        {
                            createChildElementSVG(infoboxHoverG, "rect",
                                ["id", "hra-hover-box"],
                                ["x", hoverX.toString()],
                                ["y", hoverY.toString()],
                                ["width", hoverW.toString()],
                                ["height", hoverH.toString()]);


                            let lineH = 15;
                            let textX = 5;
                            let textY = 3;

                            let performance = showWatts ? "power" : "time";

                            let infoText = [
                                "Estimation of " + performance + " you could",
                                "achieve at " + maxHR.toFixed() + "bpm,",
                                "the highest average HR of",
                                "all efforts in this segment."
                            ];

                            let infoboxH = infoText.length * lineH + textY * 2 + 5;
                            let infoboxW = 200;

                            let infoboxRectG = createChildElementSVG(infoboxHoverG, "g",
                                ["id", "hra-hover-g"],
                                ["transform", "translate(" + (34 - infoboxW).toString() + "," + (hoverY + hoverH).toString() + ")"]);

                            createChildElementSVG(infoboxRectG, "rect",
                                ["id", "hra-box"],
                                ["width", infoboxW.toString()],
                                ["height", infoboxH.toString()]);

                            for (let l = 0; l<infoText.length; l++) {
                                let text = createChildElementSVG(infoboxRectG, "text",
                                    ["x", textX.toString()],
                                    ["y", (textY + lineH * (l + 1)).toString()]);
                                text.textContent = infoText[l];
                            }
                        }

                    }

                    // insert the elements into the SVG
                    let firstMark = chart.find("circle").eq(0);
                    firstMark.before(mappedMarks);

                    let bestMark = chart.find("circle").filter(".personal-best-mark");
                    bestMark.after(lines);

                    if (infobox != null) {
                        let topG = chart.children("g").last();

                        let newG = createChildElementSVG(topG[0], "g", ["transform", topG.attr("transform")]);
                        newG.appendChild(infobox);

                        topG.after(newG);
                    }
                }
            });

            clearInterval(this.hraTimeLoop);
        }
    }
}

