module.exports = (io) => {
  io.on('connection', (socket) => {
    require('./sockets/connection_sockets')(io, socket);
  })
};
