ARG IMAGE
FROM $IMAGE

### Start of u3d install

# Install ruby, plus tools required by u3d when installing packages
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y ruby p7zip-full cpio

RUN gem install u3d

# Monkey-patch Linux file validation that is broken in u3d
RUN sed -i '/return size_validation/d' /var/lib/gems/*/gems/u3d-*/lib/u3d/download_validator.rb

# Monkey-patch ZIP extraction to preserve file permissions
RUN sed -i 's/zip_file\.each/zip_file.restore_permissions=true; &/' /var/lib/gems/*/gems/u3d-*/lib/u3d/installer.rb

# u3d unfortunately uses $USER to check whether it is being run as root
ENV USER root

# u3d complains about locale
ENV LANG en_US.UTF-8
ENV LC_ALL en_US.UTF-8

# Install Unity dependencies known to u3d
RUN apt-get update && yes | u3d dependencies --trace

ENV UNITY_VERSION 2018.4.26f1

# Preload u3d version cache
RUN u3d available --no-central -p --unity-version $UNITY_VERSION

#ENV UNITY_PACKAGES Unity,Android,Android-sdk-ndk-tools,Android-sdk-platform-tools,Android-sdk-build-tools,Android-sdk-platforms,Android-ndk,Android-open-jdk
ENV UNITY_PACKAGES unity,android,ios

RUN u3d install --trace $UNITY_VERSION -p $UNITY_PACKAGES \
      && rm -rf /root/Downloads

# Create symlink for compatibility with existing scripts - note that u3d offers an --installation-path
# argument but it seems broken as it first installs Unity to the requested path but then moves
# the files back to the default!
RUN ln -s /opt/unity-editor-$UNITY_VERSION /opt/Unity



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
