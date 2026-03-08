import { App } from '@octokit/app'

let _app: App | null = null
function getApp() {
  if (!_app) {
    _app = new App({
      appId: process.env.GITHUB_APP_ID!,
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    })
  }
  return _app
}

export async function getInstallationOctokit() {
  return getApp().getInstallationOctokit(Number(process.env.GITHUB_APP_INSTALLATION_ID))
}

export const GITHUB_ORG = 'clanka-chat'
