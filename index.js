const AWS = require('aws-sdk');

const {
    stagingFilters,
    apiVersions,
} = require('./constants');

const {
    getInstances,
    getInstanceId,
    getStagingParams,
    getRoute53Change,
} = require('./utils');

const { ACCESS_KEY, SECRET_KEY, REGION, DOMAIN } = process.env;

AWS.config.update({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
    region: REGION,
});

AWS.config.apiVersions = apiVersions;

const ec2 = new AWS.EC2();
const route53 = new AWS.Route53();
const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));

const { log } = console;

(async () => {
    log(`Starting Environment build process`);

    // await snooze(1000);
    log(`Step: Gather staging environment information`);

    const stagingData = await ec2.describeInstances(stagingFilters).promise();
    const instanceCount = getInstances(stagingData).length;

    // await snooze(1000);
    log(`Step: Gather staging environment information - ${instanceCount} Instance(s) found`);

    // await snooze(1000);
    log(`Step: Build new staging environment`);

    const stagingInstance = getStagingParams(instanceCount);
    const instanceData = await ec2.runInstances(stagingInstance).promise();
    const instanceId = getInstanceId(instanceData);

    await snooze(10000);

    const newInstanceData = await ec2.describeInstances({
        InstanceIds: [instanceId],
    }).promise();

    // await snooze(1000);
    log(`Step: Build new staging environment`);

    // await snooze(1000);
    log(`Step: Create Route53 records`);

    const { PublicIpAddress } = getInstances(newInstanceData)[0];

    const route53ChangeParams = getRoute53Change(instanceCount, PublicIpAddress);

    await route53.changeResourceRecordSets(route53ChangeParams).promise();

    // await snooze(1000);
    log(`Step: Create Route53 records - s${instanceCount}.${DOMAIN} - ${PublicIpAddress}`);

    // await snooze(1000);
    log(`Finished Staging Environment build process`);
})();
