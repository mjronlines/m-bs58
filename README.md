# 极简单Base58
#### 安装
```
npm i mjrbase58
```
### 编码
```
const Base58 = require("./lib/bs58"); //引入模块

let bs58 = new Base58()

bs58.encode('编码内容')
```
### 解码
```
const Base58 = require("./lib/bs58"); //引入模块
let bs58 = new Base58()
bs58.decode('解码内容')
```

