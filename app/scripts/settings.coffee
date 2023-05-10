'use strict'


angular.module('appSettings', [])
  .constant 'SETTINGS',
    API_DOMAIN: 'https://vigiechiro-test.herokuapp.com',
    FRONT_DOMAIN: 'https://vigiechiro-dev.in2p3.fr',
    GOOGLE_ANALYTICS_ID: 'UA-61383739-1',
    S3_BUCKET_URL: 'https://vigiechiro.s3.amazonaws.com/',
    S3_BUCKET_NAME: 'vigiechiro-test',
    S3_REGION: 'eu-west-1',
    GOOGLE_MAPS_API_KEY: 'AIzaSyCuxbBluKEqE-kJLmxhY0MHB0kSxMMkCAQ', 
    BASE_TITLE: 'Vigiechiro'
