var Mirobot = function(url){
  var self = this;
  this.ws = new WebSocket(url);
  this.ws.onmessage = function(ws_msg){self.handle_ws(ws_msg)};
}

Mirobot.prototype = {
  
  move: function(direction, distance){
    this.send({cmd: direction, arg: distance});
  },

  turn: function(direction, angle){
    this.send({cmd: direction, arg: angle});
  },

  penup: function(){
    this.send({cmd: 'penup'});
  },

  pendown: function(){
    this.send({cmd: 'pendown'});
  },

  ping: function(){
    this.send({cmd: 'ping'});
  },
  
  send: function(msg){
    msg.id = Math.random().toString(36).substr(2, 10)
    if(msg.arg){ msg.arg = msg.arg.toString(); }
    this.push_msg(msg);
  },
  
  push_msg: function(msg){
    this.msg_stack.push(msg);
    this.run_stack();
  },
  
  run_stack: function(){
    if(this.robot_state == 'idle' && this.msg_stack.length > 0){
      this.robot_state = 'receiving';
      console.log(this.msg_stack[0]);
      this.ws.send(JSON.stringify(this.msg_stack[0]));
    }
  },
  
  handle_ws: function(ws_msg){
    msg = JSON.parse(ws_msg.data);
    console.log(msg);
    if(this.msg_stack.length > 0 && this.msg_stack[0].id == msg.id){
      if(msg.status == 'accepted'){
        this.robot_state = 'running';
      }else if(msg.status == 'complete'){
        this.msg_stack.shift();
        this.robot_state = 'idle';
        this.run_stack();
      }
    }
  },
  
  robot_state: 'idle',
  msg_stack: []
}
