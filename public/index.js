const socket = io('/'); // connet to root path of our app

const videoGrid = document.querySelector('.video-grid');

const myVideo = document.createElement('video');
myVideo.muted = true; // this will mute video to ourself to prevent echo
const peers = {}; // list of all users

// send our video and audio to other user
navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then((stream) => {
        addVideoStream(myVideo, stream);
        myPeer.on('call', (call) => {
            call.answer(stream);
            const userVideo = document.createElement('video');
            call.on('stream', (userVideoStream) => {
                // this is called for us to receive users video stream
                addVideoStream(userVideo, userVideoStream);
            });
        });
        socket.on('user-connected', (userId) => {
            // every time a new user connected this is called
            connectToNewUser(userId, stream);
        });
    });

const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001',
});

socket.on('user-disconnected', (userId) => {
    if (peers[userId]) peers[userId].close(); // if we already have a connecting and that is close then disconnect the stream
});

myPeer.on('open', (id) => {
    socket.emit('join-room', ROOM_ID, id); // send join-room event to our server
});

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
};

const connectToNewUser = (userId, stream) => {
    const call = myPeer.call(userId, stream);
    // here we are calling user with userId and and then sending them the stream of our video
    const userVideo = document.createElement('video');
    call.on('stream', (userVideoStream) => {
        // this is called for us to receive users video stream
        addVideoStream(userVideo, userVideoStream);
    });
    call.on('close', () => {
        userVideo.remove();
    });
    peers[userId] = call;
};
