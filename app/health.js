var Health = function() {}

Health.prototype.getHealthRisks = function(data, systolic) {
    var risks = [];

    if (data.bmi > 25) {
        risks.push({
            'description': 'Your Body Mass Index (BMI) is over 25. This might indicate you are overweight.',
            'suggestions': [
                'Please consult your doctor regarding proper diet and weight-loss plans.',
                'Athletes with higher than average muscle mass can probably ignore this warning.'
            ]
        });
    }

    if (data.bmi < 18.5) {
        risks.push({
            'description': 'Your Body Mass Index (BMI) is lower than 18.5. You appear to be underweight.',
            'suggestions': [
                'Please consult your doctor regarding proper diet and possible eating disorders.',
                'You can view more information about healthy diet <a href="http://en.wikipedia.org/wiki/Healthy_diet" target="_blank">here</a>.'
            ]
        });
    }

    if (data.systolic - 10 > parseFloat(systolic)) {
        risks.push({
            'description': 'Your systolic blood pressure is above average. There might be problems with your cardiovascular system.',
            'suggestions': [
                '<a href="http://en.wikipedia.org/wiki/Blood_pressure#High" target="_blank">Read more</a> about health risks of increased blood pressure.'
            ]
        });
    }

    if (data.temperature > 37.5) {
        risks.push({
            'description': 'Your body temperature is above normal levels.',
            'suggestions': [
                'Please consult your doctor regarding possible infections.',
                'We recommend taking antipyretic drugs for reducing fever (most OTC drugs are based on ' +
                '<a href="http://en.wikipedia.org/wiki/Paracetamol" target="_blank">paracetamol</a>).'
            ]
        });
    }

    return risks;
};