/**
 *   ActivityBestSplitsModifier is responsible of ...
 */
function ActivityBestSplitsModifier(userSettings, activityJson, hasPowerMeter, splitsConfiguration, saveSplitsConfigrationMethod) {
    this.userSettings = userSettings;
    this.activityJson = activityJson;
    this.hasPowerMeter = hasPowerMeter;
    this.splitsConfiguration = splitsConfiguration;
    this.saveSplitsConfigrationMethod = saveSplitsConfigrationMethod || function() {};
    this.distanceUnit = ActivityBestSplitsModifier.Units.Kilometers;
}

ActivityBestSplitsModifier.Units = {
    Minutes: 0,
    Kilometers: 1,
    Miles: 2,
    
    MetersToMilesFactor: 0.000621371192,
    MetersTo0001hMileFactor: 0.621371192,
    KilometersToMilesFactor: 0.621371192,
    MilesToMetersFactor: 1609.344,
    KilometersToMetersFactor: 1000,
    
    getLabel: function(unit) {
        switch (unit) {
            case ActivityBestSplitsModifier.Units.Kilometers:
                return "km";
                
            case ActivityBestSplitsModifier.Units.Miles:
                return "mi";
                
            case ActivityBestSplitsModifier.Units.Minutes:
                return "min";
            
            default:
                return "";
        }
    }
};

/**
 * Define prototype
 */
ActivityBestSplitsModifier.prototype = {

    modify: function modify() {

        var self = this;

        // wait for Segments section load
        if ($("#segments").length === 0) {
            setTimeout(function() {
                modify.call(self);
            }, 500);
            return;
        }
        
        $("#segments").addClass("best-splits-processed");

        var segments = $("#segments"),
            bestSplitsHeader = $("<h3 class=\"inset segments-header bestsplits-header-title\" style='cursor: pointer'>Best Splits</h3>"),
            bestSplitsSection = $("<section id='bestsplits' class='pinnable-anchor' style='display: none;'></section>"),
            map,
            splitPolyline,
            splitAltitude,
            splitColor = "blue",
            selectedSplitId,
            measurementPreference = currentAthlete ? currentAthlete.get('measurement_preference') : 'meters';

        self.distanceUnit = (measurementPreference == 'meters') ? ActivityBestSplitsModifier.Units.Kilometers : ActivityBestSplitsModifier.Units.Miles;

        segments.find("h3.segments-header")
                .css("font-weight", "bold")
                .css("text-decoration", "underline")
                .css("cursor", "pointer")
                .addClass("segments-header-title")
                .before(bestSplitsHeader)
                
        if (pageView) {
            if (pageView.contexts) {
                if (pageView.contexts.contexts) {
                    if (pageView.contexts.contexts.map["converted-elapsed-time"]) {
                        if (pageView.contexts.contexts.map["converted-elapsed-time"]._activityPolyline) {
                            if (pageView.contexts.contexts.map["converted-elapsed-time"]._activityPolyline._map) {
                                map = pageView.contexts.contexts.map["converted-elapsed-time"]._activityPolyline._map.instance;
                            }
                        }
                    }
                }
            }
        }
        
        if (segments.find("[data-segment-effort-id]").length) {
            bestSplitsSection.appendTo($("#segments section.segments-list"));
        } else {
            var container = segments.find(".no-segments");
            container.find(".icon-segment-marker-white").remove();
            container.append("<h3 class=\"inset segments-header\">Best Splits</h3>");
            container.append(bestSplitsSection);
            bestSplitsSection.show();
        }

        $(".bestsplits-header-title").click(function() {
            $(".bestsplits-header-title").css("font-weight", "bold").css("text-decoration", "underline");
            $(".segments-header-title").css("font-weight", "normal").css("text-decoration", "none");
            segments.find("table.segments").hide();
            bestSplitsSection.show();
        });
        
        var removeSplitSelection = function() {
            if (map && splitPolyline) {
                map.removeLayer(splitPolyline);
                splitPolyline = null;
            }
            if (splitAltitude) {
                splitAltitude.attr("style", "fill: " + splitColor + "; opacity: 0");
            }
            $("[data-activity-points].selected").removeClass("selected").css({ "background-color": "", "color": "black" });
            selectedSplitId = undefined;
        };
        
        $(".segments-header-title").click(function() {
            $(".segments-header-title").css("font-weight", "bold").css("text-decoration", "underline");
            $(".bestsplits-header-title").css("font-weight", "normal").css("text-decoration", "none");            
            bestSplitsSection.hide();
            segments.find("table.segments").show();
            removeSplitSelection();
        });
                
        $(document).on("click", "[data-activity-points]", {}, function() {
            if (map) {
                $("[data-activity-points].selected").removeClass("selected").css({ "background-color": "", "color": "black" });
                $(this).addClass("selected").css({ "background-color": splitColor, "color": "white" });
                
                if (splitPolyline) {
                    map.removeLayer(splitPolyline);
                    splitPolyline = null;
                }                
                var range = $(this).attr("data-activity-points").split("-"),
                    start = parseInt(range[0]),
                    stop = parseInt(range[1]);
                splitPolyline = L.polyline([], { color: splitColor });
                for (var i = start; i <= stop; i++) {
                    splitPolyline.addLatLng(L.latLng(self.activityJson.latlng[i][0], self.activityJson.latlng[i][1]));
                }
                splitPolyline.addTo(map);
                var chartRect = $("#grid rect:not([data-split])");
                if (chartRect.length === 0) {
                    return;
                }
                var width = parseInt(chartRect.attr("width")),
                    height = parseInt(chartRect.attr("height"));
                var xScale = d3.scale.linear().domain([0, self.activityJson.distance[self.activityJson.distance.length - 1]]).range([0, width]);
                if (!splitAltitude) {
                    splitAltitude = d3.select("#grid").insert("rect", "rect").attr("y", "0").attr("style", "fill: " + splitColor + "; opacity: 0").attr("data-split", "true");
                }
                
                splitAltitude.attr("x", xScale(self.activityJson.distance[start]));
                splitAltitude.attr("height", height);
                splitAltitude.attr("width", xScale(self.activityJson.distance[stop] - self.activityJson.distance[start]));
                splitAltitude.attr("style", "fill: " + splitColor + "; opacity: 0.3");
                
                selectedSplitId = $(this).data("split-id");
            }
        });
        
        var splitsTable = $("<table class='dense marginless best-splits' style='text-align: center'>" +
                            "<thead>" +
                            "<tr>" +
                            "<th style='text-align: center'>Split</th>" +
                            "<th style='text-align: center'>Time/Distance</th>" +
                            "<th style='text-align: center'>Avg Speed</th>" +
                            "<th style='text-align: center'>Avg HR</th>" +
                            "<th style='text-align: center'>Avg Power</th>" +
                            "<th style='text-align: center'>Avg Cadence</th>" +
                            "<th style='text-align: center'></th>" +
                            "</tr>" +
                            "</thead>" + 
                            "<tfoot>" +
                            "<tr>" + 
                            "<td colspan='7'>Length:&nbsp;" + 
                            "<input type='number' min='1' max='9999' value='10' id='best-split-new-length' style='width: 100px' />&nbsp;" +                        
                            "Type:&nbsp;<select id='best-split-new-unit'>" +
                            "<option selected value='" + ActivityBestSplitsModifier.Units.Minutes + "'>" + ActivityBestSplitsModifier.Units.getLabel(ActivityBestSplitsModifier.Units.Minutes) + "</option>" +
                            "<option value='" + ActivityBestSplitsModifier.Units.Kilometers + "'>" + ActivityBestSplitsModifier.Units.getLabel(ActivityBestSplitsModifier.Units.Kilometers) + "</option>" +
                            "<option value='" + ActivityBestSplitsModifier.Units.Miles + "'>" + ActivityBestSplitsModifier.Units.getLabel(ActivityBestSplitsModifier.Units.Miles) + "</option>" +
                            "</select>&nbsp;" +
                            "<a class='button' id='best-split-new-add'>Add new split</a>" +
                            "</td>" +
                            "</tr>" +                                                        
                            "<tr>" +
                            "<td colspan='7' style='text-align: center'><em>Data accuracy depends on GPS logging interval used to record this activity. Move cursor over values to see exact distance/time at which the value was computed. Click on any value to see the split on map and altitude chart.</em></th>" +
                            "</tr>" +
                            "</tfoot>" +
                            "<tbody class='splits-list'>" +
                            "</tbody" +
                            "</table>");
        bestSplitsSection.append(splitsTable);
        var splitsTableBody = splitsTable.find("tbody");
                
        var splitsArray = [
            { length: 1, unit: ActivityBestSplitsModifier.Units.Kilometers, id: Helper.guid() },
            { length: 10, unit: ActivityBestSplitsModifier.Units.Kilometers, id: Helper.guid() },
            { length: 30, unit: ActivityBestSplitsModifier.Units.Kilometers, id: Helper.guid() },
            { length: 50, unit: ActivityBestSplitsModifier.Units.Kilometers, id: Helper.guid() },
            { length: 1, unit: ActivityBestSplitsModifier.Units.Minutes, id: Helper.guid() },
            { length: 10, unit: ActivityBestSplitsModifier.Units.Minutes, id: Helper.guid() },
            { length: 20, unit: ActivityBestSplitsModifier.Units.Minutes, id: Helper.guid() },
            { length: 60, unit: ActivityBestSplitsModifier.Units.Minutes, id: Helper.guid() }
        ];
        
        if (self.splitsConfiguration) {
            splitsArray = self.splitsConfiguration.splits || splitsArray;
        }
        splitsArray.sort(function(left, right) {
            if (left.unit === right.unit) {
                return left.length - right.length;
            } else {
                return left.unit - right.unit;
            }
        });
                
        var i,
            activityDistanceInMeters = this.activityJson.distance[this.activityJson.distance.length - 1],
            activityDurationInSeconds = this.activityJson.time[this.activityJson.time.length - 1];
            
        var addSplitToTable = function(split) {
            if (split.unit === ActivityBestSplitsModifier.Units.Kilometers && (split.length * ActivityBestSplitsModifier.Units.KilometersToMetersFactor) > activityDistanceInMeters) {
                return;
            }
            if (split.unit === ActivityBestSplitsModifier.Units.Miles && (split.length * ActivityBestSplitsModifier.Units.MilesToMetersFactor) > activityDistanceInMeters) {
                return;
            }            
            if (split.unit === ActivityBestSplitsModifier.Units.Minutes && (split.length * 60) > activityDurationInSeconds) {
                return;
            }
            split.id = split.id || Helper.guid();
            splitsTableBody.append("<tr id='split-" + split.id + "'>" + 
                                   "<td>" + split.length + " " + ActivityBestSplitsModifier.Units.getLabel(split.unit) + "</td>" +
                                   "<td class='value'><div id='split-" + split.id + "-time'></div><div id='split-" + split.id + "-distance'></div></td>" +
                                   "<td class='value'><div id='split-" + split.id + "-avg-speed'></div></td>" +
                                   "<td class='value'><div id='split-" + split.id + "-avg-hr'></div></td>" +
                                   "<td class='value'><div id='split-" + split.id + "-avg-power'></div></td>" +
                                   "<td class='value'><div id='split-" + split.id + "-avg-cadence'></div></td>" +
                                   "<td><button class='compact minimal toggle-effort-visibility best-split-remove' data-split-id='" + split.id + "'>Remove</button></td>" +
                                   "</tr>");
        };
        
        splitsArray.forEach(function(split) {
            addSplitToTable(split);
        });
                            
        var saveSplitsConfiguration = function(splitsArray) {
            self.saveSplitsConfigrationMethod({ splits: splitsArray });
        };
                        
        $(document).on("click", ".best-split-remove", function(e) {
            e.preventDefault();
            var splitId = $(this).data("split-id");
            if (splitId === selectedSplitId) {
                removeSplitSelection();
            }
            splitsTableBody.find("#split-" + splitId).fadeOut(function() {
                $(this).remove();
            });
            splitsArray = splitsArray.filter(function(split) {
                return split.id != splitId;
            });
            saveSplitsConfiguration(splitsArray);
        });
                        
        $("#best-split-new-add").click(function(e) {
            e.preventDefault();
            var splitLength = parseInt($("#best-split-new-length").val());
            if (splitLength < 1) {
                $("#best-split-new-length").focus();
                return;
            }
            var splitType = parseInt($("#best-split-new-unit").val());
            switch (splitType) {
                
                case ActivityBestSplitsModifier.Units.Minutes:
                    if ((splitLength * 60) > activityDurationInSeconds) {
                        $.fancybox({
                            'autoScale': true,
                            'transitionIn': 'fade',
                            'transitionOut': 'fade',
                            'type': 'iframe',
                            'content': '<div>The length of the split cannot be longer than the activity time.</div>',
                            'afterClose': function() {                                
                                $("#best-split-new-length").focus();
                            }
                        });
                        return;
                    }
                    break;
                    
                case ActivityBestSplitsModifier.Units.Kilometers:
                case ActivityBestSplitsModifier.Units.Miles:
                    var valueToCheck = splitLength * (splitType === ActivityBestSplitsModifier.Units.Miles ? ActivityBestSplitsModifier.Units.MilesToMetersFactor : ActivityBestSplitsModifier.Units.KilometersToMetersFactor);
                    if (valueToCheck > activityDistanceInMeters) {
                        $.fancybox({
                            'autoScale': true,
                            'transitionIn': 'fade',
                            'transitionOut': 'fade',
                            'type': 'iframe',
                            'content': '<div>The length of the split cannot be longer than the activity distance.</div>',
                            'afterClose': function() {                                
                                $("#best-split-new-length").focus();
                            }
                        });
                        return;
                    }
                    break;
                
                default:
                    $("#best-split-new-unit").focus();
                    return;
            }
            
            var newSplit = {
                id: Helper.guid(),
                unit: splitType,
                length: splitLength
            };
            splitsArray.push(newSplit);
            saveSplitsConfiguration(splitsArray);
            addSplitToTable(newSplit);
            processSplit(newSplit);
        });
    
        var worker,
            workerPromises = [];
        var computeSplit = function(split, activity) {                       
            if (!worker) {
                var blobURL = URL.createObjectURL(new Blob([ '(',			
                    function() {                    
                        var computeSplitWorker = function(split, activityJson, options) {
                            var i,
                                j, 
                                max,
                                distance,
                                hr,
                                totalHr,
                                totalCadence,
                                avgCadence,
                                totalPower,
                                avgPower,
                                avgSpeed,
                                time,
                                begin,
                                end,      
                                newSplitValue = function(value) {
                                    return {
                                        value: value || 0,
                                        begin: 0,
                                        end: -1,
                                        samples: 0
                                    };
                                },
                                values = {
                                    time: newSplitValue(999999999),
                                    distance: newSplitValue(),
                                    avgSpeed: newSplitValue(),
                                    avgHr: newSplitValue(),
                                    avgPower: newSplitValue(),
                                    avgCadence: newSplitValue()
                                },
                                countSamples = function(value) {
                                    value.samples = value.end - value.begin + 1;
                                },
                                totalOfValues = function(start, end, array) {
                                    var result = 0;
                                    for (; array && start <= end; start++) {
                                        result += array[start];
                                    }
                                    return result;
                                },
                                coutOfNonZero = function(start, end, array) {
                                    var result = 0;
                                    for (; array && start <= end; start++) {
                                        if (array[start]) {
                                            result += 1;
                                        }
                                    }
                                    return result;
                                },
                                checkValues = function(timeOrDistance) {
                                    totalHr = totalOfValues(begin, end, activityJson.heartrate);
                                    hr = totalHr / (end - begin + 1);
                                    if (hr > values.avgHr.value) {
                                        values.avgHr.value = hr;
                                        values.avgHr.begin = begin;
                                        values.avgHr.end = end;
                                        values.avgHr.timeOrDistance = timeOrDistance;
                                    }
                                    
                                    totalCadence = totalOfValues(begin, end, activityJson.cadence);
                                    avgCadence = totalCadence / coutOfNonZero(begin, end, activityJson.cadence);
                                    if (avgCadence > values.avgCadence.value) {
                                        values.avgCadence.value = avgCadence;
                                        values.avgCadence.begin = begin;
                                        values.avgCadence.end = end;
                                        values.avgCadence.timeOrDistance = timeOrDistance;
                                    }
                                    
                                    totalPower = totalOfValues(begin, end, activityJson.watts);
                                    avgPower = totalPower / coutOfNonZero(begin, end, activityJson.watts);
                                    if (avgPower > values.avgPower.value) {
                                        values.avgPower.value = avgPower;
                                        values.avgPower.begin = begin;
                                        values.avgPower.end = end;
                                        values.avgPower.timeOrDistance = timeOrDistance;
                                    }
                                    
                                    avgSpeed = (distance / 1000) / (time / 60 / 60);
                                    if (avgSpeed > values.avgSpeed.value) {
                                        values.avgSpeed.value = avgSpeed;
                                        values.avgSpeed.begin = begin;
                                        values.avgSpeed.end = end;
                                        values.avgSpeed.timeOrDistance = timeOrDistance;
                                    }
                                    
                                }.bind(this);
                            
                            if (split.unit === options.Minutes) {
                                var splitInSeconds = split.length * 60,
                                    timeBefore;
                                for (i = 0, max = activityJson.time.length; i < max; i++) {
                                    time = activityJson.time[i];
                                    timeBefore = 0;
                                    if (i > 0) {
                                        timeBefore = activityJson.time[i - 1];
                                        time -= timeBefore;                        
                                    }
                                    begin = i;
                                    end = i;
                                    j = i + 1;
                                    while (splitInSeconds > time && j < max) {
                                        end = j;
                                        time = activityJson.time[end] - timeBefore;
                                        j++;
                                    }
                                    if (time < splitInSeconds) {
                                        break;
                                    }
                                    
                                    distance = activityJson.distance[end] - activityJson.distance[begin];
                                    if (distance > values.distance.value) {
                                        values.distance.value = distance;
                                        values.distance.begin = begin;
                                        values.distance.end = end;
                                        values.distance.timeOrDistance = time;
                                    }
                                    
                                    checkValues(time);
                                }
                                
                                if (options.distanceUnit === options.Miles) {
                                    values.distance.value *= options.MetersTo0001hMileFactor;
                                    values.avgSpeed.value *= options.KilometersToMilesFactor;
                                }
                            }
                            
                            if (split.unit === options.Kilometers || split.unit === options.Miles) {
                                var distanceInMeters = split.length * (split.unit === options.Miles ? options.MilesToMetersFactor : options.KilometersToMetersFactor),
                                    distanceBefore,
                                    distanceInUserUnits;
                                for (i = 0, max = activityJson.distance.length; i < max; i++) {
                                    distance = activityJson.distance[i];
                                    distanceBefore = 0;
                                    if (i > 0) {
                                        distanceBefore = activityJson.distance[i - 1];
                                        distance -= distanceBefore;
                                    }
                                    begin = i;
                                    end = i;
                                    j = i + 1;
                                    while (distanceInMeters > distance && j < max) {
                                        end = j;
                                        distance = activityJson.distance[end] - distanceBefore;
                                        j++;
                                    }
                                    if (distance < distanceInMeters) {
                                        break;
                                    }
                                    
                                    distanceInUserUnits = distance * (options.distanceUnit === options.Miles ? options.MetersTo0001hMileFactor : 1);
                                    
                                    time = activityJson.time[end] - activityJson.time[begin];
                                    if (time < values.time.value) {
                                        values.time.value = time;
                                        values.time.begin = begin;
                                        values.time.end = end;
                                        values.time.timeOrDistance = distanceInUserUnits;
                                    }
                                    
                                    checkValues(distanceInUserUnits);
                                }
                                
                                if (options.distanceUnit === options.Miles) {
                                    values.distance.value *= options.MetersTo0001hMileFactor;
                                    values.avgSpeed.value *= options.KilometersToMilesFactor;
                                }
                            }
                            
                            countSamples(values.avgCadence);
                            countSamples(values.avgHr);
                            countSamples(values.avgPower);
                            countSamples(values.avgSpeed);
                            countSamples(values.distance);
                            countSamples(values.time);
                            
                            return values;
                        };                    
                        
                        self.onmessage = function(message) {
                            if (message.data && message.data.split && message.data.activity && message.data.options) {
                                message.data.result = computeSplitWorker(message.data.split, message.data.activity, message.data.options);
                                postMessage(message.data);
                            }
                        };
                        
                    }.toString(),
                ')()' ], { type: 'application/javascript' } ) );                
                worker = new Worker( blobURL );            
                worker.onmessage = function(message) {
                    workerPromises[message.data.split.id].resolve(message.data.result);
                    delete workerPromises[message.data.split.id];
                };
                URL.revokeObjectURL(blobURL);
            }
            workerPromises[split.id] = $.Deferred();
			worker.postMessage({
                split: split, 
                activity: activity, 
                options: { 
                    distanceUnit: self.distanceUnit,
                    Minutes: ActivityBestSplitsModifier.Units.Minutes,
                    Kilometers: ActivityBestSplitsModifier.Units.Kilometers,
                    Miles: ActivityBestSplitsModifier.Units.Miles,
                    MetersTo0001hMileFactor: ActivityBestSplitsModifier.Units.MetersTo0001hMileFactor,
                    KilometersToMilesFactor: ActivityBestSplitsModifier.Units.KilometersToMilesFactor,
                    MilesToMetersFactor: ActivityBestSplitsModifier.Units.MilesToMetersFactor,
                    KilometersToMetersFactor: ActivityBestSplitsModifier.Units.KilometersToMetersFactor
                }
            });
            return workerPromises[split.id].promise();
        };
        
        var processSplit = function(split) {
            var splitId = "#split-" + split.id,
                splitRow = splitsTableBody.find(splitId),
                setValue = function(elementId, value, formatFunction, defValue, tooltipFormatFunction) {
                    var element = $(elementId);
                    element.html("");
                    if (value.samples) {
                        var text = formatFunction ? formatFunction(value.value) : value.value;
                        element.text(text);
                        element.attr("data-activity-points", value.begin + "-" + value.end);
                        element.data("split-id", split.id);
                        element.css({ "cursor": "pointer" });
                        if (value.timeOrDistance && tooltipFormatFunction) {
                            element.attr("title", tooltipFormatFunction(value.timeOrDistance));
                        }
                    } else {
                        if (defValue) {
                            element.text(defValue);
                        }
                    }
                };
            splitRow.find("td.value").append("<span class='ajax-loading-image'></span>");
            
            var formatDistance = function(value) {
                    return Helper.formatNumber(value / 1000) + ActivityBestSplitsModifier.Units.getLabel(self.distanceUnit);
                },
                formatTime = function(value) {
                    return Helper.secondsToHHMMSS(value, true);
                },
                formatTooltip = split.unit === ActivityBestSplitsModifier.Units.Minutes ? formatTime : formatDistance,
                speedLabel = self.distanceUnit === ActivityBestSplitsModifier.Units.Miles ? "mph" : "km/h";
            
            computeSplit(split, self.activityJson).done(function(value) {            
                setValue(splitId + "-time", value.time, formatTime, "", formatDistance);
                setValue(splitId + "-distance", value.distance, formatDistance, "", formatTime);
                setValue(splitId + "-avg-speed", value.avgSpeed, function(value) { return Helper.formatNumber(value) + speedLabel; }, "n/a", formatTooltip);
                setValue(splitId + "-avg-hr", value.avgHr, function(value) { return Helper.formatNumber(value, 0) + "bpm"; }, "n/a", formatTooltip);
                setValue(splitId + "-avg-power", value.avgPower, function(value) { return Helper.formatNumber(value, 0) + "W"; }, "n/a", formatTooltip);
                setValue(splitId + "-avg-cadence", value.avgCadence, function(value) { return Helper.formatNumber(value, 0); }, "n/a", formatTooltip);
                splitRow.find("td.value span.ajax-loading-image").remove();
            });
        };
        
        splitsArray.forEach(function(split) {
            processSplit(split);
        });
        
        // when a user clicks 'Analysis' #segments element is removed so we have to wait for it and re-run the modify function
        var waitForSegmentsSectionRemoved = function() {
            if ($("#segments.best-splits-processed").length !== 0) {
                setTimeout(function() {
                    waitForSegmentsSectionRemoved();
                }, 1000);
                return;
            }
            modify.call(self);
        };
        waitForSegmentsSectionRemoved();
    },
};
