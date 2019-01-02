# bizhihui jks
## alias
bizhihui

## key store password
h9B5nXvKu97nCK3t8P5g

## key password
4RXKyYG6XPNpwybn

# release key hash
a7bhysxUinuNBEx9z+VZMhzmNcA=
## password
LbvemvMjcxRCCv

## command
keytool -exportcert -alias androiddebugkey -keystore %HOMEPATH%\.android\debug.keystore | openssl sha1 -binary | openssl base64
keytool -exportcert -alias bizhihui -keystore ./bizhihui.jks | openssl sha1 -binary | openssl base64
