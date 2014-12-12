var Platform = function() {};

Platform.appId = 'DemoAppId01082013GAL';
Platform.appCode = 'AJKnXv84fjrb0KIHawS0Tg';

Platform.getInstance = function() {
    return new H.service.Platform({
        app_id: this.appId,
        app_code: this.appCode,
        useCIT: true
    });
};