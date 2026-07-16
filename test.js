const OTPAuth = await import("otpauth");
let totp = new OTPAuth.TOTP({secret:"CO37UPUZUO7YVUCOFXWC7EQSDOSRHOYJ73QINDZLQ6T2BZH2BRYIQE42BCO75OTJ"})

console.log(totp.generate())