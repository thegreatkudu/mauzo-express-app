import { Redirect } from 'expo-router'
// OTP verification not required in v1 (SRS §3.1.4)
export default function OtpScreen() { return <Redirect href='/(auth)/signin' /> }
