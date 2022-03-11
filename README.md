# export-cognito

Node based CLI tool to export username and email addresses from AWS Cognito.


## Installation

Download the zip file to your machine and expand.  Change your directory to the root of the application and
then use the following npm command:

```shell
npm install -g .
```

## Usage

To use as a CLI command type export-cognito.   You will then be prompted for:

1. The AWS profile you want to use for the application.  You can create the profile with the Amplify Configure command or with the AWS CLI Configure commands.
2. The Cognito User Pool ID you obtain from the AWS console.
3. The name of the output file with extension.
