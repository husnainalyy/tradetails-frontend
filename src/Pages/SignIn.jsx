import { SignIn } from '@clerk/clerk-react';

const SignInPage = () => {
    return (
        <div className='w-full flex justify-center items-center pt-6'>
            <SignIn />
        </div>
    )
}

export default SignInPage;