import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AVAILABLE_ROLES, ApiError, createUser } from '../services/users'
import { useAuth } from '../hooks/useAuth'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FormState {
  name: string
  email: string
  password: string
  confirmPassword: string
  roles: string[]
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  roles?: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const INITIAL_FORM: FormState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  roles: [],
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}

  if (!form.name.trim()) {
    errors.name = 'Name is required.'
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!EMAIL_REGEX.test(form.email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!form.password) {
    errors.password = 'Password is required.'
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  if (form.roles.length === 0) {
    errors.roles = 'Select at least one role.'
  }

  return errors
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RegisterUserForm() {
  const { session } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [bannerError, setBannerError] = useState<string | null>(null)

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  function handleTextChange(field: keyof Omit<FormState, 'roles'>) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }))
      setErrors(prev => ({ ...prev, [field]: undefined }))
      setSuccessMessage(null)
      setBannerError(null)
    }
  }

  function handleRoleToggle(role: string) {
    setForm(prev => {
      const next = prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
      return { ...prev, roles: next }
    })
    setErrors(prev => ({ ...prev, roles: undefined }))
    setBannerError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const fieldErrors = validate(form)
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    if (!session) {
      navigate('/login', { replace: true })
      return
    }

    setLoading(true)
    setSuccessMessage(null)
    setBannerError(null)

    try {
      await createUser(
        {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          roles: form.roles,
        },
        session.token,
      )

      setSuccessMessage('User created successfully.')
      setForm(INITIAL_FORM)
      setErrors({})
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          navigate('/login', { replace: true })
          return
        }
        if (err.status === 409) {
          setErrors(prev => ({ ...prev, email: err.message }))
          return
        }
      }
      setBannerError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow p-8 flex flex-col gap-6"
    >
      {/* Banner error */}
      {bannerError && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm"
        >
          {bannerError}
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div
          role="status"
          className="rounded-lg bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm"
        >
          {successMessage}
        </div>
      )}

      {/* Name */}
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          value={form.name}
          onChange={handleTextChange('name')}
          className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.name ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        {errors.name && (
          <p className="text-xs text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleTextChange('email')}
          className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.email ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        {errors.email && (
          <p className="text-xs text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleTextChange('password')}
          className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.password ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        {errors.password && (
          <p className="text-xs text-red-600">{errors.password}</p>
        )}
      </div>

      {/* Confirm password */}
      <div className="flex flex-col gap-1">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={handleTextChange('confirmPassword')}
          className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.confirmPassword ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Roles */}
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-gray-700">Roles</legend>
        <div className="flex flex-wrap gap-3">
          {AVAILABLE_ROLES.map(role => (
            <label
              key={role}
              className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={form.roles.includes(role)}
                onChange={() => handleRoleToggle(role)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              {role}
            </label>
          ))}
        </div>
        {errors.roles && (
          <p className="text-xs text-red-600">{errors.roles}</p>
        )}
      </fieldset>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Creating user…' : 'Create user'}
      </button>
    </form>
  )
}
