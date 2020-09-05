ARG IMAGE
FROM $IMAGE

# ### Start of u3d install

# # Install ruby, plus tools required by u3d when installing packages
# RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y ruby p7zip-full cpio

# RUN gem install u3d

# # Monkey-patch Linux file validation that is broken in u3d
# RUN sed -i '/return size_validation/d' /var/lib/gems/*/gems/u3d-*/lib/u3d/download_validator.rb

# # Monkey-patch ZIP extraction to preserve file permissions
# RUN sed -i 's/zip_file\.each/zip_file.restore_permissions=true; &/' /var/lib/gems/*/gems/u3d-*/lib/u3d/installer.rb

# # u3d unfortunately uses $USER to check whether it is being run as root
# ENV USER root

# # u3d complains about locale
# ENV LANG en_US.UTF-8
# ENV LC_ALL en_US.UTF-8

# # Install Unity dependencies known to u3d
# RUN apt-get update && yes | u3d dependencies --trace

# ENV UNITY_VERSION 2018.4.26f1

# # Preload u3d version cache
# RUN u3d available --no-central -p --unity-version $UNITY_VERSION

# #ENV UNITY_PACKAGES Unity,Android,Android-sdk-ndk-tools,Android-sdk-platform-tools,Android-sdk-build-tools,Android-sdk-platforms,Android-ndk,Android-open-jdk
# ENV UNITY_PACKAGES unity,android

# RUN u3d install --trace $UNITY_VERSION -p $UNITY_PACKAGES \
#       && rm -rf /root/Downloads

# # Create symlink for compatibility with existing scripts - note that u3d offers an --installation-path
# # argument but it seems broken as it first installs Unity to the requested path but then moves
# # the files back to the default!
# RUN ln -s /opt/unity-editor-$UNITY_VERSION /opt/Unity

RUN apt-get update -qq \
    && apt-get install -qq -y --no-install-recommends \
        software-properties-common \
        unzip \
        openssh-server \
        locales \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Temporary additional layers since base images won't be republished for now
RUN locale-gen en_US.UTF-8

# To avoid annoying "perl: warning: Setting locale failed." errors,
# do not allow the client to pass custom locals, see:
# http://stackoverflow.com/a/2510548/15677
RUN sed -i 's/^AcceptEnv LANG LC_\*$//g' /etc/ssh/sshd_config

ARG DOWNLOAD_URL=https://beta.unity3d.com/download/a7ac1c6396db/UnitySetup-2018.4.26f1
ARG SHA1=0cc3abb9c5e3ad4568968f243c371313053bd784
ARG COMPONENTS=Unity,Windows,Windows-Mono,Mac,Mac-Mono,WebGL
ENV UNITY_INSTALL_LOCATION /opt/Unity

RUN wget -nv ${DOWNLOAD_URL} -O UnitySetup && \
    # compare sha1 if given
    if [ -n "${SHA1}" -a "${SHA1}" != "" ]; then \
        echo "${SHA1}  UnitySetup" | sha1sum --check -; \
    else \
        echo "no sha1 given, skipping checksum"; \
    fi && \
    # make executable
    chmod +x UnitySetup && \
    # agree with license
    echo y | \
    # install unity with required components
    ./UnitySetup \
        --unattended \
        --install-location=$UNITY_INSTALL_LOCATION \
        --verbose \
        --download-location=/tmp/unity \
        --components=$COMPONENTS && \
    # make a directory for the certificate Unity needs to run
    mkdir -p /root/.local/share/unity3d/Certificates/ && \
    # remove setup & temp files
    rm UnitySetup && \
    rm -rf /tmp/unity && \
    rm -rf /root/.local/share/Trash/* && \
    rm -rf /opt/Unity/Editor/Data/PlaybackEngines/AndroidPlayer/Tools/OpenJDK 

###################
## ANDROID SETUP ##
###################
# Android SDK versions
ARG ANDROID_NDK_VERSION=16.1.4479499
ARG ANDROID_BUILD_TOOLS_VERSION=29.0.3
ARG ANDROID_PLATFORM_VERSION=29

# Setup Android SDK/JDK Environment Variables
ENV ANDROID_INSTALL_LOCATION ${UNITY_INSTALL_LOCATION}/Editor/Data/PlaybackEngines/AndroidPlayer
ENV ANDROID_SDK_ROOT ${ANDROID_INSTALL_LOCATION}/SDK
ENV ANDROID_HOME ${ANDROID_SDK_ROOT}
ENV ANDROID_NDK_HOME ${ANDROID_SDK_ROOT}/ndk/${ANDROID_NDK_VERSION}
ENV PATH=${ANDROID_SDK_ROOT}/tools:${ANDROID_SDK_ROOT}/tools/bin:${ANDROID_SDK_ROOT}/platform-tools:${PATH}

#Setup Java
# install openJDK 8
RUN apt-get update -qq \
    && add-apt-repository ppa:openjdk-r/ppa \
    && apt-get install -qq -y --no-install-recommends \
        openjdk-8-jdk

ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64
ENV PATH=$JAVA_HOME/bin:${PATH}

# Download Android SDK commandline tools
RUN export JAVA_HOME \
    && mkdir -p ${ANDROID_SDK_ROOT} \
    && chown -R 777 ${ANDROID_INSTALL_LOCATION} \
    && wget -q https://dl.google.com/android/repository/sdk-tools-linux-4333796.zip -O android-sdk.zip \
    && unzip -q android-sdk.zip -d ${ANDROID_SDK_ROOT} \
    && rm -f android-sdk.zip \
    && ls -ahl ${ANDROID_SDK_ROOT} \ 
    && yes | sdkmanager \
        "platform-tools" \
        "ndk;${ANDROID_NDK_VERSION}" \
        > /dev/null \
    && yes | sdkmanager \
        "build-tools;${ANDROID_BUILD_TOOLS_VERSION}" \
        > /dev/null \
    && yes | sdkmanager \
        "platforms;android-${ANDROID_PLATFORM_VERSION}" \
        > /dev/null \
    && yes | sdkmanager --licenses \
    && apt-get autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /tmp/* \
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
