module.exports = Object.freeze({
  EXTERNAL: {
    BASE_URL_V1: 'https://idcr3.basf.net:443/idmrest/v1',
    BASE_URL_V2: 'https://idcr3.basf.net:443/idmrestapi/v2/service',
    AUTH: {
      userName: 'DEVOPSAT-USER',
      password: 'hdrYXtS4AOQK1w',
    },
  },
  JENKINS: {
    FOLDER_MODE: 'com.cloudbees.hudson.plugins.folder.Folder',
    ROLES: {
      PROJECT_ROLE: `com.cloudbees.plugins.credentials.CredentialsProvider.Create,com.cloudbees.plugins.credentials.CredentialsProvider.Update,com.cloudbees.plugins.credentials.CredentialsProvider.View,hudson.model.Item.Build,hudson.model.Item.Cancel,hudson.model.Item.Configure,hudson.model.Item.Create,hudson.model.Item.Discover,hudson.model.Item.Read,hudson.model.Item.Workspace,hudson.model.Run.Replay,hudson.model.Run.Update,hudson.scm.SCM.Tag`,
      GLOBAL_ROLE: {
        ADMIN: 'hudson.model.Hudson.Administer,hudson.model.Hudson.Read,com.cloudbees.plugins.credentials.CredentialsProvider.Create,com.cloudbees.plugins.credentials.CredentialsProvider.Delete,com.cloudbees.plugins.credentials.CredentialsProvider.ManageDomains,com.cloudbees.plugins.credentials.CredentialsProvider.Update,com.cloudbees.plugins.credentials.CredentialsProvider.View,hudson.model.Computer.Build,hudson.model.Computer.Configure,hudson.model.Computer.Connect,hudson.model.Computer.Create,hudson.model.Computer.Delete,hudson.model.Computer.Disconnect,hudson.model.Computer.Provision,hudson.model.Item.Build,hudson.model.Item.Cancel,hudson.model.Item.Configure,hudson.model.Item.Create,hudson.model.Item.Delete,hudson.model.Item.Discover,hudson.model.Item.Move,hudson.model.Item.Read,hudson.model.Item.Workspace,hudson.model.Run.Delete,hudson.model.Run.Replay,hudson.model.Run.Update,hudson.model.View.Configure,hudson.model.View.Create,hudson.model.View.Delete,hudson.model.View.Read,hudson.scm.SCM.Tag,jenkins.metrics.api.Metrics.HealthCheck,jenkins.metrics.api.Metrics.ThreadDump,jenkins.metrics.api.Metrics.View,org.jenkins.ci.plugins.jobimport.JobImportAction.JobImport,org.jenkins.plugins.lockableresources.LockableResourcesManager.Reserve,org.jenkins.plugins.lockableresources.LockableResourcesManager.Unlock',
        DEVELOPER: 'hudson.model.Hudson.Read',
      },
    },
  },
  SONARQUBE: {
    GROUP_PERMISSIONS: ['issueadmin', 'admin', 'scan', 'securityhotspotadmin', 'user', 'codeviewer'],
  },
});
