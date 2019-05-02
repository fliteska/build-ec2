module.exports.getInstances = data => {
    const instances = [];
    data.Reservations.forEach(res => {
        res.Instances.forEach((instance) => { instances.push(instance); });
    });
    return instances;
}

module.exports.getInstanceId = data => data.Instances[0].InstanceId;

const {
    IMAGE_ID,
    INSTANCE_TYPE,
    KEY_NAME,
    SECURITY_GROUP_ID,
    SUBNET_ID,
    HOSTED_ZONE_ID,
    DOMAIN,
} = process.env;

module.exports.getStagingParams = (envCount) => ({
    ImageId: IMAGE_ID,
    InstanceType: INSTANCE_TYPE,
    KeyName: KEY_NAME,
    MinCount: 1,
    MaxCount: 1,
    SecurityGroupIds: [
        SECURITY_GROUP_ID,
    ],
    SubnetId: SUBNET_ID,
    TagSpecifications: [
        {
            ResourceType: 'instance',
            Tags: [
                {
                    Key: 'Name',
                    Value: `GH${envCount} Staging`,
                },
                {
                    Key: 'Environment',
                    Value: 'staging',
                },
            ],
        },
    ],
});

module.exports.getRoute53Change = (instanceCount, ipAddress) => ({
    ChangeBatch: {
        Changes: [
            {
                Action: 'CREATE',
                ResourceRecordSet: {
                    Name: `s${instanceCount}.${DOMAIN}`,
                    ResourceRecords: [
                        {
                            Value: ipAddress,
                        },
                    ],
                    TTL: 60,
                    Type: 'A',
                },
            },
        ],
        Comment: 'Add Staging Environment',
    },
    HostedZoneId: HOSTED_ZONE_ID,
});
