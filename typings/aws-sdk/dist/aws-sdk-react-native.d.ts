declare module 'aws-sdk/dist/aws-sdk-react-native' {
  export * from 'aws-sdk';
  import { default as AWS } from 'aws-sdk';
  export default AWS;
}
