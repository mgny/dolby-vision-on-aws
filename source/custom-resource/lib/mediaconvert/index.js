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

const fs = require('fs');
const AWS = require('aws-sdk');

const CATEGORY = 'VOD';
const DESCRIPTION = 'dolby vision on aws';

const defaultPresets = [
    {
        name: '-default-preset-mp4-dvp5-video-24fps-2160p-15mbps',
        file: './lib/mediaconvert/presets/default-preset-mp4-dvp5-video-24fps-2160p-15mbps.json'
    },
    {
        name: '-default-preset-mp4-dvp5-video-24fps-1080p-8mbps',
        file: './lib/mediaconvert/presets/default-preset-mp4-dvp5-video-24fps-1080p-8mbps.json'
    },
    {
        name: '-default-preset-mp4-dvp5-video-25fps-2160p-15mbps',
        file: './lib/mediaconvert/presets/default-preset-mp4-dvp5-video-25fps-2160p-15mbps.json'
    },
    {
        name: '-default-preset-mp4-dvp5-video-25fps-1080p-8mbps',
        file: './lib/mediaconvert/presets/default-preset-mp4-dvp5-video-25fps-1080p-8mbps.json'
    },
    {
        name: '-default-preset-mp4-dvp5-video-30fps-2160p-15mbps',
        file: './lib/mediaconvert/presets/default-preset-mp4-dvp5-video-30fps-2160p-15mbps.json'
    },
    {
        name: '-default-preset-mp4-dvp5-video-30fps-1080p-8mbps',
        file: './lib/mediaconvert/presets/default-preset-mp4-dvp5-video-30fps-1080p-8mbps.json'
    },
    {
        name: '-default-preset-mp4-dvp5-video-50fps-2160p-15mbps',
        file: './lib/mediaconvert/presets/default-preset-mp4-dvp5-video-50fps-2160p-15mbps.json'
    },
    {
        name: '-default-preset-mp4-dvp5-video-50fps-1080p-8mbps',
        file: './lib/mediaconvert/presets/default-preset-mp4-dvp5-video-50fps-1080p-8mbps.json'
    },
    {
        name: '-default-preset-mp4-dvp5-video-60fps-2160p-15mbps',
        file: './lib/mediaconvert/presets/default-preset-mp4-dvp5-video-60fps-2160p-15mbps.json'
    },
    {
        name: '-default-preset-mp4-dvp5-video-60fps-1080p-8mbps',
        file: './lib/mediaconvert/presets/default-preset-mp4-dvp5-video-60fps-1080p-8mbps.json'
    },
    {
        name: '-default-preset-cmaf-dvp5-video-24fps-2160p-15mbps',
        file: './lib/mediaconvert/presets/default-preset-cmaf-dvp5-video-24fps-2160p-15mbps.json'
    },
    {
        name: '-default-preset-cmaf-dvp5-video-24fps-1080p-8mbps',
        file: './lib/mediaconvert/presets/default-preset-cmaf-dvp5-video-24fps-1080p-8mbps.json'
    },
    {
        name: '-default-preset-cmaf-dvp5-video-25fps-2160p-15mbps',
        file: './lib/mediaconvert/presets/default-preset-cmaf-dvp5-video-25fps-2160p-15mbps.json'
    },
    {
        name: '-default-preset-cmaf-dvp5-video-25fps-1080p-8mbps',
        file: './lib/mediaconvert/presets/default-preset-cmaf-dvp5-video-25fps-1080p-8mbps.json'
    },
    {
        name: '-default-preset-cmaf-dvp5-video-30fps-2160p-15mbps',
        file: './lib/mediaconvert/presets/default-preset-cmaf-dvp5-video-30fps-2160p-15mbps.json'
    },
    {
        name: '-default-preset-cmaf-dvp5-video-30fps-1080p-8mbps',
        file: './lib/mediaconvert/presets/default-preset-cmaf-dvp5-video-30fps-1080p-8mbps.json'
    },
    {
        name: '-default-preset-cmaf-dvp5-video-50fps-2160p-15mbps',
        file: './lib/mediaconvert/presets/default-preset-cmaf-dvp5-video-50fps-2160p-15mbps.json'
    },
    {
        name: '-default-preset-cmaf-dvp5-video-50fps-1080p-8mbps',
        file: './lib/mediaconvert/presets/default-preset-cmaf-dvp5-video-50fps-1080p-8mbps.json'
    },
    {
        name: '-default-preset-cmaf-dvp5-video-60fps-2160p-15mbps',
        file: './lib/mediaconvert/presets/default-preset-cmaf-dvp5-video-60fps-2160p-15mbps.json'
    },
    {
        name: '-default-preset-cmaf-dvp5-video-60fps-1080p-8mbps',
        file: './lib/mediaconvert/presets/default-preset-cmaf-dvp5-video-60fps-1080p-8mbps.json'
    }
];

const defaultTemplates = [
    {
        name: '-default-template-mp4-dvp5-24fps',
        file: './lib/mediaconvert/templates/default-template-mp4-dvp5-24fps.json'
    },
    {
        name: '-default-template-cmaf-dvp5-24fps',
        file: './lib/mediaconvert/templates/default-template-cmaf-dvp5-24fps.json'
    },
    {
        name: '-default-template-mp4-dvp5-25fps',
        file: './lib/mediaconvert/templates/default-template-mp4-dvp5-25fps.json'
    },
    {
        name: '-default-template-cmaf-dvp5-25fps',
        file: './lib/mediaconvert/templates/default-template-cmaf-dvp5-25fps.json'
    },
    {
        name: '-default-template-mp4-dvp5-30fps',
        file: './lib/mediaconvert/templates/default-template-mp4-dvp5-30fps.json'
    },
    {
        name: '-default-template-cmaf-dvp5-30fps',
        file: './lib/mediaconvert/templates/default-template-cmaf-dvp5-30fps.json'
    },
    {
        name: '-default-template-mp4-dvp5-50fps',
        file: './lib/mediaconvert/templates/default-template-mp4-dvp5-50fps.json'
    },
    {
        name: '-default-template-cmaf-dvp5-50fps',
        file: './lib/mediaconvert/templates/default-template-cmaf-dvp5-50fps.json'
    },
    {
        name: '-default-template-mp4-dvp5-60fps',
        file: './lib/mediaconvert/templates/default-template-mp4-dvp5-60fps.json'
    },
    {
        name: '-default-template-cmaf-dvp5-60fps',
        file: './lib/mediaconvert/templates/default-template-cmaf-dvp5-60fps.json'
    }
];

const mediaPackageTemplates = [
    {
        name: '_Ott_2160p_Avc_Aac_16x9_mvod',
        file: './lib/mediaconvert/templates/2160p_avc_aac_16x9_mvod.json'
    },
    {
        name: '_Ott_1080p_Avc_Aac_16x9_mvod',
        file: './lib/mediaconvert/templates/1080p_avc_aac_16x9_mvod.json'
    },
    {
        name: '_Ott_720p_Avc_Aac_16x9_mvod',
        file: './lib/mediaconvert/templates/720p_avc_aac_16x9_mvod.json'
    }
];

// Get the Account regional MediaConvert endpoint for making API calls
const GetEndpoints = async () => {
    const mediaconvert = new AWS.MediaConvert();
    const data = await mediaconvert.describeEndpoints().promise();

    return {
        EndpointUrl: data.Endpoints[0].Url
    };
};

const _createPresets = async (instance, presets, stackName) => {
    for (let preset of presets) {
        // Add stack name to the preset name to ensure it is unique
        let name = stackName + preset.name;
        let params = {
            Name: name,
            Category: CATEGORY,
            Description: DESCRIPTION,
            Settings: JSON.parse(fs.readFileSync(preset.file, 'utf8'))
        };

        await instance.createPreset(params).promise();
        console.log(`preset created:: ${name}`);
    }
};

const _createTemplates = async (instance, templates, stackName) => {
    for (let tmpl of templates) {
        // Load template and set unique template name
        let params = JSON.parse(fs.readFileSync(tmpl.file, 'utf8'));
        params.Name = stackName + params.Name;

        // Update preset names unless system presets
        params.Settings.OutputGroups.forEach(group => {
            group.Outputs.forEach(output => {
                if (!output.Preset.startsWith('System')) {
                    output.Preset = stackName + output.Preset;
                }
            });
        });

        await instance.createJobTemplate(params).promise();
        console.log(`template created:: ${params.Name}`);
    }
};

const Create = async (config) => {
    const mediaconvert = new AWS.MediaConvert({
        endpoint: config.EndPoint,
        region: process.env.AWS_REGION
    });

    let presets = [];
    let templates = [];

    if (config.EnableMediaPackage === 'true') {
        // Use default presets but Media Package templates
        presets = defaultPresets;
        templates = mediaPackageTemplates;
    } else {
        // Use default presets and templates
        presets = defaultPresets;
        templates = defaultTemplates;
    }

    await _createPresets(mediaconvert, presets, config.StackName);
    await _createTemplates(mediaconvert, templates, config.StackName);

    return 'success';
};

const Update = async (config) => {
    const mediaconvert = new AWS.MediaConvert({
        endpoint: config.EndPoint,
        region: process.env.AWS_REGION
    });

    let enableMediaPackage = 'false';

    // Check if the curent templates are MediaPackage or not.
    let data = await mediaconvert.listJobTemplates({ Category: CATEGORY }).promise();
    data.JobTemplates.forEach(template => {
        if (template.Name === config.StackName + '_Ott_720p_Avc_Aac_16x9_mvod') {
            enableMediaPackage = 'true';
        }
    });

    if (config.EnableMediaPackage != enableMediaPackage) {
        if (config.EnableMediaPackage == 'true') {
            console.log('Deleting default templates and creating MediaPackage templates');
            await _deleteTemplates(mediaconvert, defaultTemplates, config.StackName);
            await _createTemplates(mediaconvert, mediaPackageTemplates, config.StackName);
        } else {
            console.log('Deleting MediaPackage templates and creating default templates');
            await _deleteTemplates(mediaconvert, mediaPackageTemplates, config.StackName);
            await _createTemplates(mediaconvert, defaultTemplates, config.StackName);
        }
    } else {
        console.log('No changes to the MediaConvert templates');
    }

    return 'success';
};

const _deletePresets = async (instance, presets, stackName) => {
    for (let preset of presets) {
        let name = stackName + preset.name;

        await instance.deletePreset({ Name: name }).promise();
        console.log(`preset deleted:: ${name}`);
    }
};

const _deleteTemplates = async (instance, templates, stackName) => {
    for (let tmpl of templates) {
        let name = stackName + tmpl.name;

        await instance.deleteJobTemplate({ Name: name }).promise();
        console.log(`template deleted:: ${name}`);
    }
};

const Delete = async (config) => {
    const mediaconvert = new AWS.MediaConvert({
        endpoint: config.EndPoint,
        region: process.env.AWS_REGION
    });

    try {
        let presets = [];
        let templates = [];

        if (config.EnableMediaPackage === 'true') {
            // Use default presets but Media Package templates
            presets = defaultPresets;
            templates = mediaPackageTemplates;
        } else {
            // Use default presets and templates
            presets = defaultPresets;
            templates = defaultTemplates;
        }

        await _deletePresets(mediaconvert, presets, config.StackName);
        await _deleteTemplates(mediaconvert, templates, config.StackName);
    } catch (err) {
        console.log(err);
        throw err;
    }

    return 'success';
};

module.exports = {
    getEndpoint: GetEndpoints,
    createTemplates: Create,
    updateTemplates: Update,
    deleteTemplates: Delete
};
