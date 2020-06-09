class Base58 {
  constructor() {
    // super()
    this.ALPHABET =
      "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    this.ALPHABET_MAP = {};
    this.BASE = 58;
    for (let i = 0; i < this.ALPHABET.length; i++) {
      this.ALPHABET_MAP[this.ALPHABET.charAt(i)] = i;
    }
  }

  // 字符串转utf8格式的字节数组（英文和数字直接返回的acsii码，中文转%xx之后打断当成16进制转10进制）
  ToUTF8(str) {
    var result = new Array();

    var k = 0;
    for (var i = 0; i < str.length; i++) {
      var j = encodeURI(str[i]);
      if (j.length == 1) {
        // 未转换的字符
        result[k++] = j.charCodeAt(0);
      } else {
        // 转换成%XX形式的字符
        var bytes = j.split("%");
        for (var l = 1; l < bytes.length; l++) {
          result[k++] = parseInt("0x" + bytes[l]);
        }
      }
    }

    return result;
  }

  // 如果有特殊需求，要转成utf16，可以用以下函数
  ToUTF16(str) {
    var result = new Array();

    var k = 0;
    for (var i = 0; i < str.length; i++) {
      var j = str[i].charCodeAt(0);
      result[k++] = j & 0xff;
      result[k++] = j >> 8;
    }

    return result;
  }

  // 传进已经转成字节的数组 -->buffer(utf8格式)
  encode(buffer) {
    buffer = this.ToUTF8(buffer);
    if (buffer.length === 0) return "";
    var i,
      j,
      digits = [0];
    for (i = 0; i < buffer.length; i++) {
      for (j = 0; j < digits.length; j++) {
        // 将数据转为二进制，再位运算右边添8个0，得到的数转二进制
        // 位运算-->相当于 digits[j].toString(2);parseInt(10011100000000,2)
        digits[j] <<= 8;
      }
      digits[0] += buffer[i];
      var carry = 0;
      for (j = 0; j < digits.length; ++j) {
        digits[j] += carry;
        carry = (digits[j] / this.BASE) | 0;
        digits[j] %= this.BASE;
      }
      while (carry) {
        digits.push(carry % this.BASE);
        carry = (carry / this.BASE) | 0;
      }
    }
    // deal with leading zeros
    for (i = 0; buffer[i] === 0 && i < buffer.length - 1; i++) digits.push(0);
    let that = this;
    return digits
      .reverse()
      .map(function (digit) {
        return that.ALPHABET[digit];
      })
      .join("");
  }

  // string ---> 加密后的字符串
  decode(string) {
    if (string.length === 0) return [];
    var i,
      j,
      bytes = [0];
    for (i = 0; i < string.length; i++) {
      var c = string[i];
      // c是不是ALPHABET_MAP的key
      if (!(c in this.ALPHABET_MAP)) throw new Error("Non-base58 character");
      for (j = 0; j < bytes.length; j++) bytes[j] *= this.BASE;
      bytes[0] += this.ALPHABET_MAP[c];
      var carry = 0;
      for (j = 0; j < bytes.length; ++j) {
        bytes[j] += carry;
        carry = bytes[j] >> 8;
        // 0xff --> 11111111
        bytes[j] &= 0xff;
      }
      while (carry) {
        bytes.push(carry & 0xff);
        carry >>= 8;
      }
    }
    // deal with leading zeros
    for (i = 0; string[i] === "1" && i < string.length - 1; i++) bytes.push(0);
    return this.byteToString(bytes.reverse());
  }

  byteToString(arr) {
    if (typeof arr === "string") {
      return arr;
    }
    var str = "",
      _arr = arr;
    for (var i = 0; i < _arr.length; i++) {
      // 数组中每个数字转为二进制 匹配出开头为1的直到0的字符
      // eg:123-->"1111011"-->{0:"1111",groups: undefined, index: 0, input: "1111011"}
      var one = _arr[i].toString(2),
        v = one.match(/^1+?(?=0)/);
      if (v && one.length == 8) {
        var bytesLength = v[0].length;
        var store = _arr[i].toString(2).slice(7 - bytesLength);
        for (var st = 1; st < bytesLength; st++) {
          store += _arr[st + i].toString(2).slice(2);
        }
        str += String.fromCharCode(parseInt(store, 2));
        i += bytesLength - 1;
      } else {
        str += String.fromCharCode(_arr[i]);
      }
    }
    return str;
  }
}
module.exports = Base58;
