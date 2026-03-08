import { App } from '@octokit/app'

const app = new App({
  appId: process.env.GITHUB_APP_ID!,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, '\n'),
})

export async function getInstallationOctokit() {
  return app.getInstallationOctokit(Number(process.env.GITHUB_APP_INSTALLATION_ID))
}

export const GITHUB_ORG = 'clanka-chat'
