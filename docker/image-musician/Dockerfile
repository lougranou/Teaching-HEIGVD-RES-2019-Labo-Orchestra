FROM node:8
MAINTAINER Olivier Liechti <olivier.liechti@heig-vd.ch>


RUN npm install

#
# When we build the image, we copy the executable jar in the image file system. 
#
COPY src /opt/app/


ENTRYPOINT ["node", "/opt/app/musician.js"]
