export interface Feature {
  id: string
  title: string
  description: string
  icon: string
  highlight: string
  modes?: string[]
}

export interface PricingPlan {
  name: string
  price: string
  originalPrice?: string
  features: string[]
  highlight?: boolean
  buttonText: string
}

export interface FAQ {
  question: string
  answer: string
}

export interface Testimonial {
  name: string
  platform: string
  content: string
  rating: number
}

export interface ProcessStep {
  step: number
  title: string
  description: string
}
