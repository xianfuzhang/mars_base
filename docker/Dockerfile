FROM node:8-alpine
#create app directory
RUN mkdir -p /usr/local/mars/
WORKDIR /usr/local/mars/
COPY ./ ./
RUN npm install --production
RUN npm install ./devtools/mock --production
RUN npm install http-proxy-middleware
RUN npm install express
RUN npm install compression
RUN chmod 777 ./start.sh
CMD [ "./start.sh"]
