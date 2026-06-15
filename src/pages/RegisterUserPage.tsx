import { RegisterUserForm } from '../components/RegisterUserForm'

export function RegisterUserPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-start pt-16 px-4">
      <div className="w-full max-w-lg mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create user</h1>
        <p className="text-sm text-gray-500 mt-1">
          Fill in the details below to register a new user.
        </p>
      </div>
      <RegisterUserForm />
    </main>
  )
}
