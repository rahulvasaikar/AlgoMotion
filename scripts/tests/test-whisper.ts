import whisper from 'whisper-node';

async function test() {
    try {
        console.log("Starting whisper-node...");
        const transcript = await whisper("test.wav");
        console.log(JSON.stringify(transcript, null, 2));
    } catch (e) {
        console.error(e);
    }
}

test();
