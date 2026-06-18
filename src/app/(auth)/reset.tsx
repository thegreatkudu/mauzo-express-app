import { Redirect } from 'expo-router'
// Password reset flow not required in v1 (SRS §3.1.4)
export default function ResetScreen() { return <Redirect href='/(auth)/forgot' /> }
