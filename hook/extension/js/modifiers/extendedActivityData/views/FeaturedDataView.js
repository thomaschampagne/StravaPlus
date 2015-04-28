var FeaturedDataView = AbstractDataView.extend(function(base) {

    return {

        analysisData: null,

        init: function(analysisData, userSettings) {

            this.setViewId('FeaturedDataView_0as19sdqfd7f98q');

            base.init.call(this);

            this.hasGraph = false;

            if (!analysisData || !userSettings) {
                console.error('analysisData and userSettings are required');
            }

            this.analysisData = analysisData;

            this.userSettings = userSettings;
        },

        render: function() {

            base.render.call(this);

            if (this.analysisData.moveRatio && this.userSettings.displayActivityRatio ||
                this.analysisData.toughnessScore && this.userSettings.displayMotivationScore ||
                this.analysisData.speedData && this.userSettings.displayAdvancedSpeedData ||
                this.analysisData.heartRateData && this.userSettings.displayAdvancedHrData ||
                this.analysisData.powerData && this.userSettings.displayAdvancedPowerData ||
                this.analysisData.gradeData && this.userSettings.displayAdvancedGradeData) {

                // Add a title
//                this.content += this.generateSectionTitle('Highlighted Stats');
                this.content += this.generateSectionTitle('Highlighted Stats for '+' <strong>"'+window.activityName+'"</strong> ('+window.activityTime+")");

                this.makeGrid(7, 1); // (col, row)

                this.insertFeaturedDataIntoGrid();

                this.content += '<div class="featuredData">' + this.grid.html() + '</div>';
            }
        },

        insertFeaturedDataIntoGrid: function() {

            var speedUnitsData = this.getSpeedUnitData();
            var speedUnitPerhour = speedUnitsData[0];
            var speedUnitFactor = speedUnitsData[1];

            if (this.analysisData.moveRatio && this.userSettings.displayActivityRatio) {
                this.insertContentAtGridPosition(0, 0, this.analysisData.moveRatio.toFixed(2), 'Move Ratio', '', 'displayActivityRatio'); // Move ratio
            }

            if (this.analysisData.toughnessScore && this.userSettings.displayMotivationScore) {
                this.insertContentAtGridPosition(1, 0, this.analysisData.toughnessScore.toFixed(0), 'Toughness Factor', '', 'displayMotivationScore'); // Toughness score
            }

            if (this.analysisData.speedData && this.userSettings.displayAdvancedSpeedData) {
                this.insertContentAtGridPosition(2, 0, (this.analysisData.speedData.upperQuartileSpeed * speedUnitFactor).toFixed(1), '75% Quartile Speed', speedUnitPerhour, 'displayAdvancedSpeedData'); // Q3 Speed
            }

            if (this.analysisData.heartRateData && this.userSettings.displayAdvancedHrData) {
                this.insertContentAtGridPosition(3, 0, this.analysisData.heartRateData.TRIMP.toFixed(0), 'TRaining IMPulse', '', 'displayAdvancedHrData');
                this.insertContentAtGridPosition(4, 0, this.analysisData.heartRateData.activityHeartRateReserve.toFixed(0), 'Heart Rate Reserve Avg', '%', 'displayAdvancedHrData');
            }

            if (this.analysisData.powerData && this.userSettings.displayAdvancedPowerData) {
                this.insertContentAtGridPosition(5, 0, this.analysisData.powerData.weightedWattsPerKg.toFixed(2), 'Weighted Watts/kg', 'w/kg', 'displayAdvancedPowerData'); // Avg watt /kg
            }

            if (this.analysisData.gradeData && this.userSettings.displayAdvancedGradeData) {
                this.insertContentAtGridPosition(6, 0, this.analysisData.gradeData.gradeProfile, 'Grade Profile', '', 'displayAdvancedGradeData');
            }

            // Remove empty case in grid. This avoid unwanted padding on feature view rendering
            this.grid.find('td:empty').remove();
        }
    }
});
