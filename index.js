const S3 = require('aws-sdk/clients/s3');
const pressAnyKey = require('press-any-key');

async function* ListObjects(s3, params) {
  let isTruncated = false;
  let token;
  do {
    const response = await s3.listObjectsV2({ 
        ...params, ContinuationToken: token
    }).promise();

    // One could also yield each item separately
    yield response.Contents;

    ({ IsTruncated: isTruncated, NextContinuationToken: token  } = response);
  } while (isTruncated)
}

async function main() {
  const Bucket = process.argv.slice(2)[0];
  const s3 = new S3({ params: { Bucket }});

  for await (const contents of ListObjects(s3, { MaxKeys: 2})) {
    const objects = contents.map(({ Key }) => Key).join(', ')
    console.log(objects);
    await pressAnyKey('Press any key to fetch next result...');
  }
}

main().then(() => console.log('Finished'))