FROM node:8-alpine
#create app directory
RUN mkdir -p /usr/local/mars/
WORKDIR /usr/local/mars/
COPY ./ ./
RUN npm install yarn -g
RUN yarn --production
RUN yarn ./devtools/mock --production
RUN yarn add express http-proxy-middleware compression
RUN chmod 777 ./start.sh
CMD [ "./start.sh"]
