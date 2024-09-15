export default class WebSocketClient {
  constructor(url, terminal, token) {
    this.url = `${url}?token=${token}`; // 将 token 添加到 URL 中
    this.terminal = terminal;
    this.webSocket = null;
  }

  connect() {
    this.webSocket = new WebSocket(this.url);

    // 处理 WebSocket 打开事件
    this.webSocket.onopen = () => {
      this.terminal.write('\x1b[32mWebSocket connection opened.\x1b[0m\r\n'); // Green color
    };

    // 处理接收消息事件
    this.webSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "start") {
          // 绿色表示任务启动
          this.terminal.write(`\r\n\x1b[32m--- Task Started ---\x1b[0m\r\n`);
          this.terminal.write(`Task ID: ${message.task_id}\r\n`);
          this.terminal.write(`Task Name: ${message.task_name}\r\n`);
          this.terminal.write(`Username: ${message.username}\r\n`);
          this.terminal.write(`Host: ${message.host}\r\n`);
          this.terminal.write(`Port: ${message.port}\r\n`);

          // 格式化命令输出
          const formattedCommand = this.formatCommand(message.command);
          this.terminal.write(`Command:\r\n${formattedCommand}\r\n`);

          this.terminal.write(`Start Time: ${message.start_time}\r\n`);
        } else if (message.type === "complete") {
          // 绿色表示任务完成
          this.terminal.write(`\r\n\x1b[32m--- Task Completed ---\x1b[0m\r\n`);
          this.terminal.write(`Task ID: ${message.task_id}\r\n`);
          this.terminal.write(`Task Name: ${message.task_name}\r\n`);
          this.terminal.write(`Username: ${message.username}\r\n`);
          this.terminal.write(`Host: ${message.host}\r\n`);
          this.terminal.write(`Port: ${message.port}\r\n`);

          const formattedCommand = this.formatCommand(message.command);
          this.terminal.write(`Command:\r\n${formattedCommand}\r\n`);

          this.terminal.write(`Output:\r\n${message.output}\r\n`);
          this.terminal.write(`Error Output:\r\n${message.error_output || 'None'}\r\n`);
          this.terminal.write(`Start Time: ${message.start_time}\r\n`);
          this.terminal.write(`End Time: ${message.end_time}\r\n`);
          this.terminal.write(`Duration: ${message.duration}\r\n`);
        } else if (message.type === "error") {
          // 红色表示任务失败
          this.terminal.write(`\r\n\x1b[31m--- Task Failed ---\x1b[0m\r\n`);
          this.terminal.write(`Task ID: ${message.task_id}\r\n`);
          this.terminal.write(`Error: ${message.error_output || 'Unknown error'}\r\n`);
        } else {
          this.terminal.write(`Unknown message type received.\r\n`);
        }
      } catch (error) {
        this.terminal.write(`Received message: ${event.data}\r\n`);
      }
    };

    // 处理 WebSocket 错误事件
    this.webSocket.onerror = (event) => {
      this.terminal.write('\x1b[31mWebSocket error: ' + (event.message || 'Unknown error') + '\x1b[0m\r\n'); // Red color for error
    };

    // 处理 WebSocket 关闭事件
    this.webSocket.onclose = (event) => {
      this.terminal.write('WebSocket connection closed: ' + (event.code || 'Unknown code') + '\r\n');
    };
  }

  disconnect() {
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
    }
  }

  // Helper method to format the command section
  formatCommand(command) {
    // 处理命令中的换行和缩进
    return command.replace(/\n/g, '\r\n').replace(/\t/g, '    ');
  }
}
