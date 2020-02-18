#!/usr/bin/env groovy
pipeline {
  options {
    skipDefaultCheckout()
  }
  agent {
    node {
      label 'docker'
    }
  }
  stages {
    stage('build') {
      steps {
        container('docker-basf-node'){
          checkout scm
          sh '''#!/bin/bash
echo \'Installing all npm dependencies\'
NODE_ENV=development npm install --loglevel http --no-audit

echo \'Building Autobots Manager Front-end\'
if [[ $BRANCH_NAME == "master" ]]; then
  echo "we are on master!"
  npm run prod-build
else
  echo "we are NOT on master!"
  npm run test-build
fi
status=$?
echo \'status of build stage was\' $status

# echo 'Creating Build Archive'
# echo 'status of archive stage was' $?
# return $status
'''
          stash includes: 'dist/**', name: 'dist1'
        }
      }
    }
    stage('Deliver for test') {
      when {
        branch 'dev'
      }
      agent {
        node {
          label 'TEST_WORDPRESS'
        }

      }
      steps {
        echo 'Deploy to TEST.'
        unstash 'dist1'
        sh '''rm -rf /opt/nginx-web-root/autobots-admin-app/fe/dist
cp -r ./dist /opt/nginx-web-root/autobots-admin-app/fe
ls -l /opt/nginx-web-root/autobots-admin-app/fe'''
      }
    }
    stage('Deliver to PROD') {
      agent {
        node {
          label 'PROD_WORDPRESS'
        }
      }
      when {
        branch 'master' // change this later to "master" when we are ready for prod delivery 
      }
      steps {
        echo "Deploy to PROD..."
        unstash 'dist1'
        sh '''rm -rf /opt/nginx-web-root/autobots-admin-app/fe/dist
cp -r ./dist /opt/nginx-web-root/autobots-admin-app/fe
ls -l /opt/nginx-web-root/autobots-admin-app/fe'''
      }
    }
  }
}
