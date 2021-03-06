import fs from 'fs';
import { exec } from '@actions/exec';
import ImageTag from './image-tag';

class Docker {
  static async build(buildParameters, silent = false) {
    const { path, dockerfile, baseImage, uid, gid } = buildParameters;
    const { version, platform, suffix } = baseImage;

    let img = baseImage;
    if (platform === 'android' || platform === 'Android') {
      // img = 'sedind/unity3d:2018.4.26f1-android';
      img =
        'gableroux/unity3d@sha256:d9753191a3c228eb02451531ca4e186e020a4eb14deb2456399c3eb0079e7593';
    }

    const tag = new ImageTag({ repository: '', name: 'unity-builder', version, platform, suffix });
    const command = `docker build ${path} \
      --file ${dockerfile} \
      --build-arg IMAGE=${img} \
      --build-arg UID=${uid} \
      --build-arg GID=${gid} \
      --tag ${tag}`;

    await exec(command, undefined, { silent });

    return tag;
  }

  static async run(image, parameters, silent = false) {
    const {
      version,
      workspace,
      runnerTempPath,
      platform,
      projectPath,
      buildName,
      buildPath,
      buildFile,
      buildMethod,
      buildVersion,
      androidVersionCode,
      androidKeystoreName,
      androidKeystoreBase64,
      androidKeystorePass,
      androidKeyaliasName,
      androidKeyaliasPass,
      customParameters,
    } = parameters;

    const command = `docker run \
        --workdir /github/workspace \
        --rm \
        --env UNITY_LICENSE \
        --env UNITY_LICENSE_FILE \
        --env UNITY_EMAIL \
        --env UNITY_PASSWORD \
        --env UNITY_SERIAL \
        --env UNITY_VERSION="${version}" \
        --env PROJECT_PATH="${projectPath}" \
        --env BUILD_TARGET="${platform}" \
        --env BUILD_NAME="${buildName}" \
        --env BUILD_PATH="${buildPath}" \
        --env BUILD_FILE="${buildFile}" \
        --env BUILD_METHOD="${buildMethod}" \
        --env VERSION="${buildVersion}" \
        --env ANDROID_VERSION_CODE="${androidVersionCode}" \
        --env ANDROID_KEYSTORE_NAME="${androidKeystoreName}" \
        --env ANDROID_KEYSTORE_BASE64="${androidKeystoreBase64}" \
        --env ANDROID_KEYSTORE_PASS="${androidKeystorePass}" \
        --env ANDROID_KEYALIAS_NAME="${androidKeyaliasName}" \
        --env ANDROID_KEYALIAS_PASS="${androidKeyaliasPass}" \
        --env CUSTOM_PARAMETERS="${customParameters}" \
        --env HOME=/github/home \
        --env GITHUB_REF \
        --env GITHUB_SHA \
        --env GITHUB_REPOSITORY \
        --env GITHUB_ACTOR \
        --env GITHUB_WORKFLOW \
        --env GITHUB_HEAD_REF \
        --env GITHUB_BASE_REF \
        --env GITHUB_EVENT_NAME \
        --env GITHUB_WORKSPACE=/github/workspace \
        --env GITHUB_ACTION \
        --env GITHUB_EVENT_PATH \
        --env RUNNER_OS \
        --env RUNNER_TOOL_CACHE \
        --env RUNNER_TEMP \
        --env RUNNER_WORKSPACE \
        --volume "/var/run/docker.sock":"/var/run/docker.sock" \
        --volume "${runnerTempPath}/_github_home":"/github/home" \
        --volume "${runnerTempPath}/_github_workflow":"/github/workflow" \
        --volume "${workspace}":"/github/workspace" \
        ${image}`;

    fs.mkdirSync(`${runnerTempPath}/_github_home`, { recursive: true });
    fs.mkdirSync(`${runnerTempPath}/_github_workflow`, { recursive: true });

    await exec(command, undefined, { silent });
  }
}

export default Docker;
