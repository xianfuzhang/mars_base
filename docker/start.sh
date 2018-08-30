#!/bin/sh

while true; do
    countProxy=`ps -ef | grep 'node ./proxy.js' | grep -v grep | wc -l`
    countMock=`ps -ef | grep 'node ./devtools/mock/app/app.js' | grep -v grep | wc -l`

    if [ $countProxy -gt 0 ]; then
        echo 'proxy server is running';
    else
        node ./proxy.js &
    fi

    if [ $countMock -gt 0 ]; then
        echo 'mock server is running';
    else
        node ./devtools/mock/app/app.js &
    fi

    sleep 1
done

echo 'exiting'

