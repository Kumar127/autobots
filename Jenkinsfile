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
          sh '''
# whoami
# pwd
# npm config ls -l
echo \'Installing all npm dependencies\'
# npm install --loglevel http
npm install
tar czf /tmp/be-app.tar.gz .
cp /tmp/be-app.tar.gz .
return $status
'''
          stash includes: '**.tar.gz', name: 'dist1'
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
        sh '''
rm -rf /opt/nginx-web-root/autobots-admin-app/be/*
cp be-app.tar.gz /opt/nginx-web-root/autobots-admin-app/be/
cd /opt/nginx-web-root/autobots-admin-app/be/
tar -xf *.tar.gz --warning=no-timestamp
rm .env.production
npx pm2 stop autobots-self-serv-app || true
npm start
npx pm2 status autobots-self-serv-app
'''
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
        sh '''
rm -rf /opt/nginx-web-root/autobots-admin-app/be/*
cp be-app.tar.gz /opt/nginx-web-root/autobots-admin-app/be/
cd /opt/nginx-web-root/autobots-admin-app/be/
tar -xf *.tar.gz --warning=no-timestamp
cp .env.production .env
npx pm2 stop autobots-self-serv-app || true
npm start
npx pm2 status autobots-self-serv-app
'''
      }
    }
  }
}
