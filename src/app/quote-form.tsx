'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { gql, ApolloClient, InMemoryCache } from '@apollo/client';

type FormData = {
  workPhone: string;
  subject: string;
  message: string;
  lastName: string;
  howMuchDoYouEnjoyEatingPie: string;
  howDidYouHearAboutThisJobPosting: string[];
  homePhone: string;
  firstName: string;
  email: string;
  department: string;
  companyName: string;
  cellPhone: string;
  appointmentDate: string;
  acceptTerms: string;
};

type FormProperties = {
  csrf: {
    name: string;
    token: string;
  },
  honeypot: {
    name: string;
    value: string;
  },
  reCaptcha: {
    enabled: boolean;
    handle: string;
    name: string;
  };
  loadingText: string;
  successMessage: string;
  errorMessage: string;
};

type Params = {
  formData: FormData;
  reCaptchaValue: string;
  formProperties: FormProperties;
};

const defaultFormData: FormData = {
  workPhone: '',
  subject: '',
  message: '',
  lastName: '',
  howMuchDoYouEnjoyEatingPie: '',
  howDidYouHearAboutThisJobPosting: [],
  homePhone: '',
  firstName: '',
  email: '',
  department: '',
  companyName: '',
  cellPhone: '',
  appointmentDate: '',
  acceptTerms: '',
};

const defaultFormProperties: FormProperties = {
  csrf: {
    name: '',
    token: '',
  },
  honeypot: {
    name: '',
    value: '',
  },
  reCaptcha: {
    enabled: false,
    handle: '',
    name: '',
  },
  loadingText: '',
  successMessage: '',
  errorMessage: '',
};

const RECAPTCHA_SITE_KEY = '6Lce6nQmAAAAAO5d4LWC6TkECxNRSG7WNiVj17B1';

const client = new ApolloClient({
  uri: '/graphql/api',
  headers: {
    'Cache-Control': 'no-cache',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest',
    'X-Craft-Solspace-Freeform-Mode': 'Headless',
  },
  cache: new InMemoryCache(),
});

async function getFormProperties(formId: number) {
  // See https://docs.solspace.com/craft/freeform/v4/developer/graphql/#how-to-render-a-form
  const response = await fetch(`/freeform/form/properties/${formId}`, { headers: { 'Accept': 'application/json' }});

  if (!response.ok) {
    throw new Error('Failed to fetch Craft Freeform Form properties');
  }

  return response.json();
}

async function saveQuoteSubmission(params: Params) {
  const { reCaptchaValue, formData, formProperties } = params;
  const { csrf, honeypot, reCaptcha } = formProperties;

  return await client.mutate({
    mutation: gql`
      mutation SaveQuoteSubmission(
        $honeypot: FreeformHoneypotInputType,
        $reCaptcha: FreeformReCaptchaInputType,
        $csrfToken: FreeformCsrfTokenInputType,
        $workPhone: String,
        $subject: String,
        $message: String,
        $lastName: String,
        $howMuchDoYouEnjoyEatingPie: String,
        $howDidYouHearAboutThisJobPosting: [String],
        $homePhone: String,
        $firstName: String,
        $email: String,
        $department: String,
        $companyName: String,
        $cellPhone: String,
        $appointmentDate: DateTime,
        $acceptTerms: String
      ) {
        save_quote_Submission(
          honeypot: $honeypot
          reCaptcha: $reCaptcha
          csrfToken: $csrfToken
          workPhone: $workPhone
          subject: $subject
          message: $message
          lastName: $lastName
          howMuchDoYouEnjoyEatingPie: $howMuchDoYouEnjoyEatingPie
          howDidYouHearAboutThisJobPosting: $howDidYouHearAboutThisJobPosting
          homePhone: $homePhone
          firstName: $firstName
          email: $email
          department: $department
          companyName: $companyName
          cellPhone: $cellPhone
          appointmentDate: $appointmentDate
          acceptTerms: $acceptTerms
        ) {
          submissionId
          success
        }
      }
    `,
    variables: {
      honeypot: {
        name: honeypot.name,
        value: honeypot.value,
      },
      csrfToken: {
        name: csrf.name,
        value: csrf.token,
      },
      reCaptcha: {
        name: reCaptcha.name,
        value: reCaptchaValue,
      },
      firstName: formData.firstName,
      lastName: formData.lastName,
      companyName: formData.companyName,
      email: formData.email,
      cellPhone: formData.cellPhone,
      homePhone: formData.homePhone,
      workPhone: formData.workPhone,
      subject: formData.subject,
      appointmentDate: formData.appointmentDate,
      department: formData.department,
      howMuchDoYouEnjoyEatingPie: formData.howMuchDoYouEnjoyEatingPie,
      message: formData.message,
      howDidYouHearAboutThisJobPosting: formData.howDidYouHearAboutThisJobPosting,
      acceptTerms: formData.acceptTerms,
    },
  });
}

const Form = () => {
  const errorMessageRef = useRef<HTMLDivElement>(null);
  const successMessageRef = useRef<HTMLDivElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const { executeRecaptcha } = useGoogleReCaptcha();

  const [formData, setFormData] = useState(defaultFormData);
  const [reCaptchaValue, setReCaptchaValue] = useState('');
  const [formProperties, setFormProperties] = useState(defaultFormProperties);

  const startProcessing = () => {
    if (submitButtonRef.current) {
      submitButtonRef.current.style.cursor = 'not-allowed';
      submitButtonRef.current.innerText = formProperties.loadingText;
    }
  };

  const stopProcessing = () => {
    if (submitButtonRef.current) {
      submitButtonRef.current.innerText = 'Submit';
      submitButtonRef.current.style.cursor = 'pointer';
    }
  };

  const showSuccess = () => {
    if (successMessageRef.current) {
      successMessageRef.current.style.display = 'block';
      scrollToTop();
    }
  };

  const hideSuccess = () => {
    if (successMessageRef.current) {
      successMessageRef.current.style.display = 'none';
    }
  };

  const showError = (error: any) => {
    console.error(error);

    if (errorMessageRef.current) {
      errorMessageRef.current.style.display = 'block';
      scrollToTop();
    }
  };

  const hideError = () => {
    if (errorMessageRef.current) {
      errorMessageRef.current.style.display = 'none';
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReCaptchaVerify = useCallback(async () => {
    if (!executeRecaptcha) {
      return;
    }

    const token = await executeRecaptcha();
    setReCaptchaValue(token);
  }, [executeRecaptcha]);

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();

    hideError();
    hideSuccess();
    startProcessing();

    handleReCaptchaVerify().then(async () => {
      try {
        const response = await saveQuoteSubmission({ reCaptchaValue, formData, formProperties });

        if (response && response.data && response.data['save_quote_Submission'] && response.data['save_quote_Submission'].success) {
          showSuccess();
        } else if (response && response.errors) {
          showError(response.errors);
        }
      } catch (error) {
        showError(error);
      }

      stopProcessing();
    });
  };

  const handleHowDidYouHearAboutThisJobPosting = (event: React.ChangeEvent<HTMLInputElement>): void => {
    let howDidYouHearAboutThisJobPosting = [...formData.howDidYouHearAboutThisJobPosting];

    if (event.target.checked) {
      howDidYouHearAboutThisJobPosting.push(event.target.value);
    } else {
      howDidYouHearAboutThisJobPosting = howDidYouHearAboutThisJobPosting.filter((value) => value !== event.target.value);
    }

    setFormData({
      ...formData,
      howDidYouHearAboutThisJobPosting,
    });
  };

  useEffect(() => {
    handleReCaptchaVerify().then();
  }, [handleReCaptchaVerify]);

  /**
   * Note the ignore variable which is initialized to false, and is set to true during cleanup.
   * This ensures your code doesn't suffer from "race conditions": network responses may arrive in a different order than you sent them.
   */
  useEffect(() => {
    let ignore = false;

    // Set your Freeform Form ID from Craft.
    const formId = 4;

    getFormProperties(formId).then(formProperties => {
      if (!ignore) {
        setFormProperties(formProperties);
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <>
      <div ref={successMessageRef} className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" style={{ display: 'none' }}>
        <p>{formProperties.successMessage}</p>
      </div>
      <div ref={errorMessageRef} className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" style={{ display: 'none' }}>
        <p>{formProperties.errorMessage}</p>
      </div>
      <form className="text-center flex flex-col items-center justify-center" onSubmit={handleSubmit}>
        <h3 className="mb-4 text-xl font-normal">Quote Form</h3>
        <div className="flex flex-col w-full space-y-6">
          <div className="flex flex-row space-x-4 w-full">
            <div className="flex flex-col items-start justify-center space-y-2 w-full">
              <label htmlFor="firstName">First Name <span className="ml-1 text-[red]">*</span></label>
              <input className="form-input w-full" name="firstName" type="text" id="firstName" value={formData.firstName} onChange={event => setFormData({ ...formData, firstName: event.target.value })} required />
            </div>
            <div className="flex flex-col items-start justify-center space-y-2 w-full">
              <label htmlFor="lastName">Last Name <span className="ml-1 text-[red]">*</span></label>
              <input className="form-input w-full" name="lastName" type="text" id="lastName" value={formData.lastName} onChange={event => setFormData({ ...formData, lastName: event.target.value })} required />
            </div>
          </div>
          <div className="flex flex-row w-full">
            <div className="flex flex-col items-start justify-center space-y-2 w-full">
              <label htmlFor="companyName">Organization Name</label>
              <input className="form-input w-full" name="companyName" type="text" id="companyName" value={formData.companyName} onChange={event => setFormData({ ...formData, companyName: event.target.value })} />
            </div>
          </div>
          <div className="flex flex-row w-full">
            <div className="flex flex-col items-start justify-center space-y-2 w-full">
              <label htmlFor="email">Email <span className="ml-1 text-[red]">*</span></label>
              <div className="text-sm">We&apos;ll never share your email with anyone else.</div>
              <input className="form-input w-full" name="email" type="email" id="email" value={formData.email} onChange={event => setFormData({ ...formData, email: event.target.value })} required />
            </div>
          </div>
          <div className="flex flex-row space-x-4 w-full">
            <div className="flex flex-col items-start justify-center space-y-2 w-full">
              <label htmlFor="cellPhone">Cell Phone <span className="ml-1 text-[red]">*</span></label>
              <input className="form-input w-full" name="cellPhone" type="tel" id="cellPhone" value={formData.cellPhone} onChange={event => setFormData({ ...formData, cellPhone: event.target.value })} required />
            </div>
            <div className="flex flex-col items-start justify-center space-y-2 w-full">
              <label htmlFor="homePhone">Home Phone</label>
              <input className="form-input w-full" name="homePhone" type="tel" id="homePhone" value={formData.homePhone} onChange={event => setFormData({ ...formData, homePhone: event.target.value })} />
            </div>
            <div className="flex flex-col items-start justify-center space-y-2 w-full">
              <label htmlFor="workPhone">Work Phone</label>
              <input className="form-input w-full" name="workPhone" type="tel" id="workPhone" value={formData.workPhone} onChange={event => setFormData({ ...formData, workPhone: event.target.value })} />
            </div>
          </div>
          <div className="flex flex-row space-x-4 w-full">
            <div className="flex flex-col items-start justify-center space-y-2 w-full">
              <label htmlFor="subject">Subject <span className="ml-1 text-[red]">*</span></label>
              <select className="form-select w-full" name="subject" id="subject" value={formData.subject} onChange={event => setFormData({ ...formData, subject: event.target.value })} required>
                <option value="">I need some help with...</option>
                <option value="myHomework">My homework</option>
                <option value="practicingMyHammerDance">Practicing my hammer dance</option>
                <option value="findingMyBellyButton">Finding my belly button</option>
              </select>
            </div>
            <div className="flex flex-col items-start justify-center space-y-2 w-full">
              <label htmlFor="appointmentDate">Appointment Date</label>
              <input className="form-input w-full" name="appointmentDate" type="text" id="appointmentDate" placeholder="YYYY/MM/DD" autoComplete="off" value={formData.appointmentDate} onChange={event => setFormData({ ...formData, appointmentDate: event.target.value })} />
            </div>
            <div className="flex flex-col items-start justify-center space-y-2 w-full">
              <label htmlFor="department">Department <span className="ml-1 text-[red]">*</span></label>
              <select className="form-select w-full" name="department" id="department" value={formData.department} onChange={event => setFormData({ ...formData, department: event.target.value })} required>
                <option value="">Please choose...</option>
                <option value="sales@example.com">Sales</option>
                <option value="service@example.com">Service</option>
                <option value="support@example.com">Support</option>
              </select>
            </div>
          </div>
          <div className="flex flex-row space-x-4 w-full">
            <div className="flex flex-col items-start justify-center space-y-2 w-full">
              <label htmlFor="howMuchDoYouEnjoyEatingPie-1" className="flex flex-row">How much do you enjoy eating pie?</label>
              <div className="flex flex-row space-x-4">
                <label htmlFor="howMuchDoYouEnjoyEatingPie-1" className="flex flex-row items-center justify-center">
                  <input className="form-radio mr-2" name="howMuchDoYouEnjoyEatingPie" type="radio" id="howMuchDoYouEnjoyEatingPie-1" value="1" onChange={event => setFormData({ ...formData, howMuchDoYouEnjoyEatingPie: event.target.value })} /> 1
                </label>
                <label htmlFor="howMuchDoYouEnjoyEatingPie-2" className="flex flex-row items-center justify-center">
                  <input className="form-radio mr-2" name="howMuchDoYouEnjoyEatingPie" type="radio" id="howMuchDoYouEnjoyEatingPie-2" value="2" onChange={event => setFormData({ ...formData, howMuchDoYouEnjoyEatingPie: event.target.value })} /> 2
                </label>
                <label htmlFor="howMuchDoYouEnjoyEatingPie-3" className="flex flex-row items-center justify-center">
                  <input className="form-radio mr-2" name="howMuchDoYouEnjoyEatingPie" type="radio" id="howMuchDoYouEnjoyEatingPie-3" value="3" onChange={event => setFormData({ ...formData, howMuchDoYouEnjoyEatingPie: event.target.value })} /> 3
                </label>
                <label htmlFor="howMuchDoYouEnjoyEatingPie-4" className="flex flex-row items-center justify-center">
                  <input className="form-radio mr-2" name="howMuchDoYouEnjoyEatingPie" type="radio" id="howMuchDoYouEnjoyEatingPie-4" value="4" onChange={event => setFormData({ ...formData, howMuchDoYouEnjoyEatingPie: event.target.value })} /> 4
                </label>
                <label htmlFor="howMuchDoYouEnjoyEatingPie-5" className="flex flex-row items-center justify-center">
                  <input className="form-radio mr-2" name="howMuchDoYouEnjoyEatingPie" type="radio" id="howMuchDoYouEnjoyEatingPie-5" value="5" onChange={event => setFormData({ ...formData, howMuchDoYouEnjoyEatingPie: event.target.value })} /> 5
                </label>
              </div>
            </div>
          </div>
          <div className="flex flex-row space-x-4 w-full">
            <div className="flex flex-col items-start justify-center space-y-2 w-full">
              <label htmlFor="message">Message <span className="ml-1 text-[red]">*</span></label>
              <textarea className="form-textarea w-full" name="message" id="message" rows={5} value={formData.message} onChange={event => setFormData({ ...formData, message: event.target.value })} required></textarea>
            </div>
          </div>
          <div className="flex flex-row space-x-4 w-full">
            <div className="flex flex-col items-start justify-center space-y-2 w-full">
              <label htmlFor="howDidYouHearAboutThisJobPosting-Newspaper">How did you hear about us?</label>
              <label className="flex flex-row items-center justify-center">
                <input className="form-checkbox mr-2" name="howDidYouHearAboutThisJobPosting[]" type="checkbox" id="howDidYouHearAboutThisJobPosting-Newspaper" value="Newspaper" onChange={handleHowDidYouHearAboutThisJobPosting} /> Newspaper
              </label>
              <label className="flex flex-row items-center justify-center">
                <input className="form-checkbox mr-2" name="howDidYouHearAboutThisJobPosting[]" type="checkbox" id="howDidYouHearAboutThisJobPosting-Radio" value="Radio" onChange={handleHowDidYouHearAboutThisJobPosting} /> Radio
              </label>
              <label className="flex flex-row items-center justify-center">
                <input className="form-checkbox mr-2" name="howDidYouHearAboutThisJobPosting[]" type="checkbox" id="howDidYouHearAboutThisJobPosting-CarrierPigeon" value="Carrier Pigeon" onChange={handleHowDidYouHearAboutThisJobPosting} /> Carrier Pigeon
              </label>
              <label className="flex flex-row items-center justify-center">
                <input className="form-checkbox mr-2" name="howDidYouHearAboutThisJobPosting[]" type="checkbox" id="howDidYouHearAboutThisJobPosting-Other" value="Other" onChange={handleHowDidYouHearAboutThisJobPosting} /> Other
              </label>
            </div>
          </div>
          <div className="flex flex-row space-x-4 w-full">
            <div className="flex flex-col items-start justify-center space-y-2 w-full">
              <label htmlFor="acceptTerms" className="flex flex-row items-center justify-center">
                <input className="form-checkbox mr-2" name="acceptTerms" type="checkbox" id="acceptTerms" value="yes" onChange={event => setFormData({ ...formData, acceptTerms: event.target.checked ? event.target.value : '' })} required />
                I agree to the <a href="https://solspace.com" className="mx-1 underline">terms &amp; conditions</a> required by this site. <span className="ml-1 text-[red]">*</span>
              </label>
            </div>
          </div>
          <div className="flex flex-row w-full">
            <div className="flex flex-row items-center justify-center space-y-2 w-full">
              <button ref={submitButtonRef} className="btn-primary" type="submit">Submit</button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default function QuoteForm() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
      <Form />
    </GoogleReCaptchaProvider>
  );
};