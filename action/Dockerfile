ARG IMAGE
FROM $IMAGE

# Setup Android SDK/JDK Environment Variables
ENV UNITY_INSTALL_LOCATION /opt/Unity
ARG ANDROID_NDK=http://dl.google.com/android/repository/android-ndk-r16b-linux-x86_64.zip
ARG ANDROID_JDK
ARG ANDROID_SDK_BUILDTOOLS=http://dl.google.com/android/repository/build-tools_r28-linux.zip
ARG ANDROID_SDK_SDKTOOLS=http://dl.google.com/android/repository/sdk-tools-linux-4333796.zip
ARG ANDROID_SDK_PLATFORMTOOLS=http://dl.google.com/android/repository/platform-tools_r28.0.0-linux.zip
ARG ANDROID_SDK_PLATFORM=http://dl.google.com/android/repository/platform-28_r06.zip

ENV ANDROID_INSTALL_LOCATION ${UNITY_INSTALL_LOCATION}/Editor/Data/PlaybackEngines/AndroidPlayer
ENV ANDROID_HOME ${ANDROID_INSTALL_LOCATION}/SDK
ENV ANDROID_NDK_HOME ${ANDROID_INSTALL_LOCATION}/NDK

RUN mkdir -p ${ANDROID_INSTALL_LOCATION}
RUN mkdir -p /opt/tmp

RUN rm -rf /opt/Unity/Editor/Data/PlaybackEngines/AndroidPlayer/NDK
RUN rm -rf /opt/Unity/Editor/Data/PlaybackEngines/AndroidPlayer/SDK

RUN wget ${ANDROID_SDK_PLATFORMTOOLS} -O /opt/tmp/platform-tools.zip
RUN unzip -q -o /opt/tmp/platform-tools.zip -d ${ANDROID_HOME} 

RUN wget ${ANDROID_SDK_BUILDTOOLS} -O /opt/tmp/build-tools.zip 
RUN unzip -q -o /opt/tmp/build-tools.zip -d ${ANDROID_HOME}/build-tools 
RUN mv ${ANDROID_HOME}/build-tools/android-9 ${ANDROID_HOME}/build-tools/28.0.0 

RUN wget ${ANDROID_SDK_PLATFORM} -O /opt/tmp/platform.zip
RUN unzip -q -o /opt/tmp/platform.zip -d ${ANDROID_HOME}/platforms
RUN mv ${ANDROID_HOME}/platforms/android-9 ${ANDROID_HOME}/platforms/android-28

RUN wget ${ANDROID_NDK} -O /opt/tmp/android-ndk.zip
RUN unzip -q -o /opt/tmp/android-ndk.zip -d ${ANDROID_NDK_HOME}
RUN mv ${ANDROID_NDK_HOME}/*/* ${ANDROID_NDK_HOME}

RUN  yes | ${ANDROID_HOME}/tools/bin/sdkmanager --licenses \
    && chmod -R 777 ${ANDROID_INSTALL_LOCATION} \
    && ls -ahl ${ANDROID_HOME} \
    && apt-get autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /opt/tmp/* \
    && rm -rf /var/tmp/* 

ARG UNAME=runner
ARG UID=1000
ARG GID=1000

RUN chown $UID:$GID -R /opt/Unity
RUN chmod 755 /opt/Unity

LABEL "com.github.actions.name"="Unity - Builder"
LABEL "com.github.actions.description"="Build Unity projects for different platforms."
LABEL "com.github.actions.icon"="box"
LABEL "com.github.actions.color"="gray-dark"

LABEL "repository"="http://github.com/webbertakken/unity-actions"
LABEL "homepage"="http://github.com/webbertakken/unity-actions"
LABEL "maintainer"="Webber Takken <webber@takken.io>"

RUN bash -c 'mkdir -p /github/{home,workflow,workspace}' && chown $UID:$GID -R /github/
RUN getent group $GID || groupadd -g $GID $UNAME
RUN id -u $UID &>/dev/null || useradd -m -u $UID -g $GID -s /bin/bash -d /github/home $UNAME

ADD default-build-script /UnityBuilderAction
ADD steps /steps
RUN chmod -R +x /steps
ADD entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

USER $UID:$GID
