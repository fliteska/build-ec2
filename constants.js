module.exports.apiVersions = {
    ec2: '2016-11-15',
    route53: '2013-04-01',
};

module.exports.stagingFilters = {
    Filters: [
        {
            Name: 'tag:Environment',
            Values: [
                'staging',
            ],
        },
    ],
};
