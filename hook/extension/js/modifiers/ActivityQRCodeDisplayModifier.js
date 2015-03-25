/*
 *   ActivityQRCodeDisplayModifier is responsible of ...
 */
function ActivityQRCodeDisplayModifier(appResources, activityId) {
    this.appResources_ = appResources;
    this.activityId_ = activityId;
}

/**
 * Define prototype
 */
ActivityQRCodeDisplayModifier.prototype = {

    modify: function modify() {

        var html = '<a href="javascript:;" id="activityFlashCodebutton" class="button" title="Flash code for your mobile app"><img src="' + this.appResources_.qrCodeIcon + '"/></a>';

        jQuery('.collapse.button').first().before(html).each(function() {

            // Once dom inserted
            jQuery('#activityFlashCodebutton').click(function() {

                jQuery.fancybox('<div align="center"><h2>#stravaplus Activity Flash code</h2><h3>Scan from smartphone to get activity on Strava mobile app.<br />It can be hard/take a long time to find an activity on your smartphone...</h3><p><div style="padding: 0px 60px 0px 60px;" id="qrcode"></div></p><h3>Save by right click on image then "Save image as..."</h3></div>');

                var qrcode = new QRCode("qrcode", {
                    text: "http://app.strava.com/activities/" + this.activityId_,
                    width: 384,
                    height: 384,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });

            }.bind(this));

        }.bind(this));
    }
};
