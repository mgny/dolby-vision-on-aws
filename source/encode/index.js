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
const error = require('./lib/error.js');
const _ = require('lodash');

const getMp4Group = (outputPath) => ({
    Name: 'File Group',
    OutputGroupSettings: {
        Type: 'FILE_GROUP_SETTINGS',
        FileGroupSettings: {
            Destination: `${outputPath}/mp4/`
        }
    },
    Outputs: []
});

const getHlsGroup = (outputPath) => ({
    Name: 'HLS Group',
    OutputGroupSettings: {
        Type: 'HLS_GROUP_SETTINGS',
        HlsGroupSettings: {
            SegmentLength: 5,
            MinSegmentLength: 0,
            Destination: `${outputPath}/hls/`
        }
    },
    Outputs: []
});

const getDashGroup = (outputPath) => ({
    Name: 'DASH ISO',
    OutputGroupSettings: {
        Type: 'DASH_ISO_GROUP_SETTINGS',
        DashIsoGroupSettings: {
            SegmentLength: 30,
            FragmentLength: 3,
            Destination: `${outputPath}/dash/`
        }
    },
    Outputs: []
});

const getCmafGroup = (outputPath) => ({
    Name: 'CMAF',
    OutputGroupSettings: {
        Type: 'CMAF_GROUP_SETTINGS',
        CmafGroupSettings: {
            SegmentLength: 30,
            FragmentLength: 3,
            Destination: `${outputPath}/cmaf/`
        }
    },
    Outputs: []
});

const getMssGroup = (outputPath) => ({
    Name: 'MS Smooth',
    OutputGroupSettings: {
        Type: 'MS_SMOOTH_GROUP_SETTINGS',
        MsSmoothGroupSettings: {
            FragmentLength: 2,
            ManifestEncoding: 'UTF8',
            Destination: `${outputPath}/mss/`
        }
    },
    Outputs: []
});


const applySettingsIfNeeded = (isCustomTemplate, originalGroup, customGroup) => {
    if (isCustomTemplate) {
        return _.merge({}, originalGroup, customGroup);
    }

    return originalGroup;
};

const getBaseJobSettings = () => ({
    Settings: {
        Inputs: [{
            FilterEnable: 'AUTO',
            PsiControl: 'USE_PSI',
            FilterStrength: 0,
            DeblockFilter: 'DISABLED',
            DenoiseFilter: 'DISABLED',
            TimecodeSource: 'EMBEDDED'
        }],
        OutputGroups: []
    }
});

const getBaseJobTemplate = () => ({
    JobTemplate: {
        Settings: {
            OutputGroups: []
        }
    }
});


const getBaseOutputGroups_cmaf = () => ({
    Name: 'CMAF',
    OutputGroupSettings: {
        Type: 'CMAF_GROUP_SETTINGS',
        CmafGroupSettings: {
            MpdProfile: 'MAIN_PROFILE',
            ClientCache: 'ENABLED',
            CodecSpecification: 'RFC_4281',
            ManifestCompression: 'NONE',
            ManifestDurationFormat: 'INTEGER',
            MinFinalSegmentLength: 0,
            StreamInfResolution: 'INCLUDE',
            WriteSegmentTimelineInRepresentation: 'DISABLED'
        }
    },
    Outputs: []
});


const getBaseOutputGroups_mp4 = () => ({
    Name: 'File Group',
    OutputGroupSettings: {
        Type: 'FILE_GROUP_SETTINGS',
        FileGroupSettings: {}
    },
    Outputs: []
});


const getBaseContainerSettings_cmaf = () => ({
    ContainerSettings: {
        Container: 'CMFC',
        CmfcSettings: {
            Scte35Esam: 'NONE',
            Scte35Source: 'NONE'
        }
    }
});


const getBaseContainerSettings_mp4 = () => ({
    ContainerSettings: {
        Container: 'MP4',
        Mp4Settings: {
          CslgAtom: 'INCLUDE',
          CttsVersion: 0,
          FreeSpaceBox: 'EXCLUDE',
          MoovPlacement: 'PROGRESSIVE_DOWNLOAD'
        }
    }
});


const getBaseVideoDescription = () => ({
    VideoDescription: {
        AfdSignaling: 'NONE',
        AntiAlias: 'ENABLED',
        ColorMetadata: 'INSERT',
        DropFrameTimecode: 'ENABLED',
        RespondToAfd: 'NONE',
        ScalingBehavior: 'DEFAULT',
        Sharpness: 50,
        TimecodeInsertion: 'DISABLED',
        VideoPreprocessors: {
            DolbyVision: {
                L6Mode: 'PASSTHROUGH',
                Profile: 'PROFILE_5'
            }
        },
        CodecSettings: {
            Codec: 'H_265',
            H265Settings: {
                CodecLevel: 'AUTO',
                CodecProfile: 'MAIN10_MAIN',
                WriteMp4PackagingType: 'HVC1',
                AdaptiveQuantization: 'HIGH',
                AlternateTransferFunctionSei: 'DISABLED',
                DynamicSubGop: 'STATIC',
                FlickerAdaptiveQuantization: 'DISABLED',
                FramerateControl: 'INITIALIZE_FROM_SOURCE',
                FramerateConversionAlgorithm: 'DUPLICATE_DROP',
                GopBReference: 'DISABLED',
                GopClosedCadence: 1,
                InterlaceMode: 'PROGRESSIVE',
                MinIInterval: 0,
                NumberBFramesBetweenReferenceFrames: 2,
                NumberReferenceFrames: 3,
                ParControl: 'INITIALIZE_FROM_SOURCE',
                SampleAdaptiveOffsetFilterMode: 'ADAPTIVE',
                Slices: 1,
                SlowPal: 'DISABLED',
                SpatialAdaptiveQuantization: 'ENABLED',
                Telecine: 'NONE',
                TemporalAdaptiveQuantization: 'ENABLED',
                TemporalIds: 'DISABLED',
                Tiles: 'ENABLED',
                UnregisteredSeiTimecode: 'DISABLED'
            }
        }
    }
});


const getBaseAudioDescriptions = () => ({
    AudioDescriptions: [
      {
        AudioSourceName: 'Audio Selector 1',
        AudioTypeControl: 'FOLLOW_INPUT',
        LanguageCodeControl: 'FOLLOW_INPUT',
        CodecSettings: {
          Codec: 'EAC3_ATMOS',
          Eac3AtmosSettings: {
            Bitrate: 448000,
            SurroundExMode: 'NOT_INDICATED',
            LoRoSurroundMixLevel: -3,
            LtRtSurroundMixLevel: -3,
            LtRtCenterMixLevel: -3,
            LoRoCenterMixLevel: -3,
            BitstreamMode: 'COMPLETE_MAIN',
            StereoDownmix: 'DPL2',
            DynamicRangeCompressionRf: 'FILM_LIGHT',
            DynamicRangeCompressionLine: 'FILM_LIGHT',
            MeteringMode: 'ITU_BS_1770_4',
            DialogueIntelligence: 'ENABLED',
            SampleRate: 48000,
            SpeechThreshold: 20
          }
        }
      }
    ]
});

const CmafGroupSettingsParams = [
    'FragmentLength',
    'SegmentLength',
    'SegmentControl',
    'WriteDashManifest',
    'WriteHlsManifest'
];

const OutputParams = [
    'NameModifier'
];

const AudioDescriptionsParams = [
    'AudioTypeControl',
    'AudioType',
    'LanguageCodeControl',
    'LanguageCode'
];

const Eac3AtmosSettingsParams = [
    'SurroundExMode',
    'LoRoSurroundMixLevel',
    'LtRtSurroundMixLevel',
    'Bitrate',
    'LtRtCenterMixLevel',
    'LoRoCenterMixLevel',
    'CodingMode',
    'BitstreamMode',
    'StereoDownmix',
    'DynamicRangeCompressionRf',
    'SampleRate',
    'DynamicRangeCompressionLine',
    'MeteringMode',
    'DialogueIntelligence',
    'SpeechThreshold'
];

const VideoDescriptionParams = [
    'Width',
    'Height'
];

const H265SettingsParams = [
    'QualityTuningLevel',
    'RateControlMode',
    'Bitrate',
    'MaxBitrate',
    'HrdBufferSize',
    'GopSizeUnits',
    'GopSize',
    'MinIInterval',
    'SceneChangeDetect',
    'CodecLevel',
    'CodecProfile',
    'WriteMp4PackagingType',
    'AdaptiveQuantization',
    'NumberBFramesBetweenReferenceFrames',
    'NumberReferenceFrames',
    'AlternateTransferFunctionSei',
    'FlickerAdaptiveQuantization',
    'FramerateControl',
    'FramerateConversionAlgorithm',
    'GopBReference',
    'GopClosedCadence',
    'InterlaceMode',
    'ParControl',
    'SampleAdaptiveOffsetFilterMode',
    'Slices',
    'SlowPal',
    'SpatialAdaptiveQuantization',
    'Telecine',
    'TemporalAdaptiveQuantization',
    'TemporalIds',
    'Tiles',
    'UnregisteredSeiTimecode',
];




const setParams = (params, dst, src) => {
    params.forEach(function(param){
        if(src[param]) {
            dst[param] = src[param];
        }
    });
};


const getCustomTmpl  = (userTmpl) => {

    let tmp_JobTemplate = getBaseJobTemplate();

    userTmpl.JobTemplate.Settings.OutputGroups.forEach(group => {

        if (group.OutputGroupSettings.Type === 'CMAF_GROUP_SETTINGS') {
            let tmp_OutputGroups = getBaseOutputGroups_cmaf();
            setParams(CmafGroupSettingsParams, tmp_OutputGroups.OutputGroupSettings.CmafGroupSettings, group.OutputGroupSettings.CmafGroupSettings);

            group.Outputs.forEach(output => {

                let tmp_output = getBaseContainerSettings_cmaf();

                if(output.VideoDescription) {
                    //VIDEO
                    Object.assign(tmp_output, getBaseVideoDescription());
                    setParams(OutputParams, tmp_output, output);

                    setParams(VideoDescriptionParams, tmp_output.VideoDescription, output.VideoDescription);
                    setParams(H265SettingsParams, tmp_output.VideoDescription.CodecSettings.H265Settings, output.VideoDescription.CodecSettings.H265Settings);
                } 
                else if (output.AudioDescriptions) {
                    //AUDIO
                    Object.assign(tmp_output, getBaseAudioDescriptions());
                    setParams(OutputParams, tmp_output, output);

                    setParams(AudioDescriptionsParams, tmp_output.AudioDescriptions[0], output.AudioDescriptions[0]);
                    setParams(Eac3AtmosSettingsParams, tmp_output.AudioDescriptions[0].CodecSettings.Eac3AtmosSettings, output.AudioDescriptions[0].CodecSettings.Eac3AtmosSettings);
                }

                tmp_OutputGroups.Outputs.push(tmp_output);
            });
            tmp_JobTemplate.JobTemplate.Settings.OutputGroups.push(tmp_OutputGroups);
        }

        if (group.OutputGroupSettings.Type === 'FILE_GROUP_SETTINGS') {
            let tmp_OutputGroups = getBaseOutputGroups_mp4();

            group.Outputs.forEach(output => {
                let tmp_output = getBaseContainerSettings_mp4();

                if(output.VideoDescription) {
                    //VIDEO
                    Object.assign(tmp_output, getBaseVideoDescription());
                    setParams(OutputParams, tmp_output, output);
                    setParams(VideoDescriptionParams, tmp_output.VideoDescription, output.VideoDescription);
                    setParams(H265SettingsParams, tmp_output.VideoDescription.CodecSettings.H265Settings, output.VideoDescription.CodecSettings.H265Settings);
                } 
                else if (output.AudioDescriptions) {
                    //AUDIO
                    Object.assign(tmp_output, getBaseAudioDescriptions());
                    setParams(AudioDescriptionsParams, tmp_output.AudioDescriptions[0], output.AudioDescriptions);
                    setParams(Eac3AtmosSettingsParams, tmp_output.AudioDescriptions[0].CodecSettings.Eac3AtmosSettings, output.AudioDescriptions[0].CodecSettings.Eac3AtmosSettings);
                }
                tmp_OutputGroups.Outputs.push(tmp_output);
            });
            tmp_JobTemplate.JobTemplate.Settings.OutputGroups.push(tmp_OutputGroups);
        }
    });

    return tmp_JobTemplate;
};


exports.handler = async (event) => {
    console.log(`REQUEST:: ${JSON.stringify(event, null, 2)}`);

    const s3 = new AWS.S3();

    const mediaconvert = new AWS.MediaConvert({
        endpoint: process.env.EndPoint
    });

    
    try {
        const outputPath = `s3://${event.destBucket}/${event.guid}`;
        
        let tmpl;
        var isCustomTemplate = false;

        let job = getBaseJobSettings();

        job.Role = process.env.MediaConvertRole;
        job.UserMetadata = { guid: event.guid, workflow: event.workflowName };

        if(event.srcVideo){
            let inputPathVideo = `s3://${event.srcBucket}/${event.srcVideo}`;
            job.Settings.Inputs[0].FileInput = inputPathVideo;

            job.Settings.Inputs[0].VideoSelector = {
                ColorSpace: 'FOLLOW',
                Rotate: 'DEGREE_0'
            };
        }

        if(event.srcExternalAudio){
            let inputPathAudio = `s3://${event.srcBucket}/${event.srcExternalAudio}`;

            job.Settings.Inputs[0].AudioSelectors = {
                'Audio Selector 1': {
                    Offset: 0,
                    DefaultSelection: 'DEFAULT',
                    ProgramSelection: 1,
                    ExternalAudioFileInput: inputPathAudio
                }
            };
        }

        if(event.jobTemplate.type === "custom") {
            const jobtemplate = await s3.getObject({ Bucket: event.tmplBucket, Key: event.jobTemplate.name }).promise();
            let usr_tmpl = JSON.parse(jobtemplate.Body);

            console.log(`USER_TEMPLATE:: ${JSON.stringify(usr_tmpl, null, 2)}`);

            tmpl = getCustomTmpl(usr_tmpl);
            isCustomTemplate = true;
        }
        else if(event.jobTemplate.type === "default") {
            job.JobTemplate = event.jobTemplate.name
            tmpl = await mediaconvert.getJobTemplate({ Name: event.jobTemplate.name }).promise();
        }
        else {
            throw new Error('unsupported jobTemplate type is found::');
        }

        console.log(`TEMPLATE:: ${JSON.stringify(tmpl, null, 2)}`);

        const mp4 = getMp4Group(outputPath);
        const hls = getHlsGroup(outputPath);
        const dash = getDashGroup(outputPath);
        const cmaf = getCmafGroup(outputPath);
        const mss = getMssGroup(outputPath);
        
        // OutputGroupSettings:Type is required and must be one of the following
        // HLS_GROUP_SETTINGS | DASH_ISO_GROUP_SETTINGS | FILE_GROUP_SETTINGS | MS_SMOOTH_GROUP_SETTINGS | CMAF_GROUP_SETTINGS,
        // Using this to determine the output types in the the job Template
        tmpl.JobTemplate.Settings.OutputGroups.forEach(group => {
            let found = false, defaultGroup = {};

            if (group.OutputGroupSettings.Type === 'FILE_GROUP_SETTINGS') {
                found = true;
                defaultGroup = mp4;
            }

            if (group.OutputGroupSettings.Type === 'HLS_GROUP_SETTINGS') {
                found = true;
                defaultGroup = hls;
            }

            if (group.OutputGroupSettings.Type === 'DASH_ISO_GROUP_SETTINGS') {
                found = true;
                defaultGroup = dash;
            }

            if (group.OutputGroupSettings.Type === 'MS_SMOOTH_GROUP_SETTINGS') {
                found = true;
                defaultGroup = mss;
            }

            if (group.OutputGroupSettings.Type === 'CMAF_GROUP_SETTINGS') {
                found = true;
                defaultGroup = cmaf;
            }

            if (found) {
                console.log(`${group.Name} found in Job Template`);
                const outputGroup = applySettingsIfNeeded(isCustomTemplate, defaultGroup, group);

                job.Settings.OutputGroups.push(outputGroup);
            }
        });

        

        //if enabled the TimeCodeConfig needs to be set to ZEROBASED not passthrough
        //https://docs.aws.amazon.com/mediaconvert/latest/ug/job-requirements.html
        if (event.acceleratedTranscoding === 'PREFERRED' || event.acceleratedTranscoding === 'ENABLED') {
            job.AccelerationSettings = {"Mode" : event.acceleratedTranscoding}
            job.Settings.TimecodeConfig = {"Source" : "ZEROBASED"}
            job.Settings.Inputs[0].TimecodeSource = "ZEROBASED"
        }

        let data = await mediaconvert.createJob(job).promise();
        event.encodingJob = job;
        event.encodeJobId = data.Job.Id;

        console.log(`JOB:: ${JSON.stringify(data, null, 2)}`);
    } catch (err) {
        await error.handler(event, err);
        throw err;
    }

    return event;
};
