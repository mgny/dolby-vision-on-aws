/*********************************************************************************************************************
 *  Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.                                           *
 *                                                                                                                    *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance    *
 *  with the License. A copy of the License is located at                                                             *
 *                                                                                                                    *
 *      http://www.apache.org/licenses/LICENSE-2.0                                                                    *
 *                                                                                                                    *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES *
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions    *
 *  and limitations under the License.                                                                                *
 *********************************************************************************************************************/

const AWS = require('aws-sdk');

let PutNotification = async (config) => {
    const s3 = new AWS.S3();

    let params;

    params = {
        Bucket: config.Source,
        NotificationConfiguration: {
            LambdaFunctionConfigurations: [{
                Events: ['s3:ObjectCreated:*'],
                LambdaFunctionArn: config.IngestArn,
                Filter: {
                    Key: {
                        FilterRules: [{
                            Name: 'suffix',
                            Value: 'json'
                        }]
                    }
                }
            }]
        }
    };

    console.log(`Configuring S3 event for MetadataFile`);
    await s3.putBucketNotificationConfiguration(params).promise();

    return 'success';
};

module.exports = {
    putNotification: PutNotification
};
