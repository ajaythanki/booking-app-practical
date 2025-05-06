import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { createBooking, checkAvailability, BookingType, BookingSlot } from '../store/slices/bookingSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { format, addDays } from 'date-fns';
import { Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface BookingFormValues {
  customerName: string;
  customerEmail: string;
  bookingDate: string;
  bookingType: BookingType;
  bookingSlot: BookingSlot;
  startTime: string;
  endTime: string;
}

const BookingForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, success } = useSelector((state: RootState) => state.booking);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const tomorrow = addDays(new Date(), 1);
  const formattedTomorrow = format(tomorrow, 'yyyy-MM-dd');

  const initialValues: BookingFormValues = {
    customerName: '',
    customerEmail: '',
    bookingDate: formattedTomorrow,
    bookingType: 'FULL_DAY',
    bookingSlot: null,
    startTime: '09:00',
    endTime: '17:00',
  };

  const validationSchema = Yup.object().shape({
    customerName: Yup.string().required('Customer name is required'),
    customerEmail: Yup.string().email('Invalid email').required('Customer email is required'),
    bookingDate: Yup.date()
      .min(formattedTomorrow, 'Booking date must be in the future')
      .required('Booking date is required'),
    bookingType: Yup.string()
      .oneOf(['FULL_DAY', 'HALF_DAY', 'CUSTOM'], 'Invalid booking type')
      .required('Booking type is required'),
    bookingSlot: Yup.string()
      .when('bookingType', {
        is: 'HALF_DAY',
        then: (schema) => schema.oneOf(['FIRST_HALF', 'SECOND_HALF'], 'Please select a booking slot').required('Booking slot is required'),
        otherwise: (schema) => schema.nullable(),
      }),
    startTime: Yup.string()
      .when('bookingType', {
        is: 'CUSTOM',
        then: (schema) => schema.required('Start time is required'),
        otherwise: (schema) => schema,
      }),
    endTime: Yup.string()
      .when('bookingType', {
        is: 'CUSTOM',
        then: (schema) => 
          schema
            .required('End time is required')
            .test(
              'is-greater',
              'End time must be after start time',
              function (value) {
                const { startTime } = this.parent;
                return !startTime || !value || value > startTime;
              }
            ),
        otherwise: (schema) => schema,
      }),
  });

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  }, [success, navigate]);

  const handleCheckAvailability = async (values: BookingFormValues) => {
    setCheckingAvailability(true);
    setAvailabilityChecked(false);
    
    try {
      const checkData = {
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        bookingDate: values.bookingDate,
        bookingType: values.bookingType,
      };

      if(values.bookingType === 'HALF_DAY'){
        checkData.bookingSlot = values.bookingSlot;
      }
      if(values.bookingType === 'CUSTOM'){
        checkData.startTime = values.startTime;
        checkData.endTime = values.endTime;
      }

      
      const resultAction = await dispatch(checkAvailability(checkData));
      
      if (checkAvailability.fulfilled.match(resultAction)) {
        setIsAvailable(true);
      } else {
        setIsAvailable(false);
      }
    } catch (error) {
      setIsAvailable(false);
    } finally {
      setAvailabilityChecked(true);
      setCheckingAvailability(false);
    }
  };

  const handleSubmit = async (values: BookingFormValues) => {
    if (!availabilityChecked || !isAvailable) {
      await handleCheckAvailability(values);
      return;
    }
    
    const bookingData = {
      customerName: values.customerName,
      customerEmail: values.customerEmail,
      bookingDate: values.bookingDate,
      bookingType: values.bookingType,
    };

    if(values.bookingType === 'HALF_DAY'){
      bookingData.bookingSlot = values.bookingSlot;
    }
    if(values.bookingType === 'CUSTOM'){
      bookingData.startTime = values.startTime;
      bookingData.endTime = values.endTime;
    }
    
    dispatch(createBooking(bookingData));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Booking</h1>
        <p className="text-gray-600 mt-1">
          Fill out the form below to create a new booking
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Booking Details</h2>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, setFieldValue, isValid }) => (
            <Form className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <Field
                    type="text"
                    name="customerName"
                    id="customerName"
                    className={`w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.customerName && touched.customerName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                  />
                  <ErrorMessage
                    name="customerName"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Email
                  </label>
                  <Field
                    type="email"
                    name="customerEmail"
                    id="customerEmail"
                    className={`w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.customerEmail && touched.customerEmail ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="john@example.com"
                  />
                  <ErrorMessage
                    name="customerEmail"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Booking Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <Field
                    type="date"
                    name="bookingDate"
                    id="bookingDate"
                    min={formattedTomorrow}
                    className={`w-full pl-10 px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.bookingDate && touched.bookingDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('bookingDate', e.target.value);
                      setAvailabilityChecked(false);
                    }}
                  />
                </div>
                <ErrorMessage
                  name="bookingDate"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Booking Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className={`flex items-center p-4 border rounded-md cursor-pointer ${
                    values.bookingType === 'FULL_DAY' 
                      ? 'bg-indigo-50 border-indigo-500' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}>
                    <Field
                      type="radio"
                      name="bookingType"
                      value="FULL_DAY"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      onChange={() => {
                        setFieldValue('bookingType', 'FULL_DAY');
                        setFieldValue('bookingSlot', null);
                        setAvailabilityChecked(false);
                      }}
                    />
                    <span className="ml-2 text-sm">Full Day</span>
                  </label>
                  
                  <label className={`flex items-center p-4 border rounded-md cursor-pointer ${
                    values.bookingType === 'HALF_DAY' 
                      ? 'bg-indigo-50 border-indigo-500' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}>
                    <Field
                      type="radio"
                      name="bookingType"
                      value="HALF_DAY"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      onChange={() => {
                        setFieldValue('bookingType', 'HALF_DAY');
                        setAvailabilityChecked(false);
                      }}
                    />
                    <span className="ml-2 text-sm">Half Day</span>
                  </label>
                  
                  <label className={`flex items-center p-4 border rounded-md cursor-pointer ${
                    values.bookingType === 'CUSTOM' 
                      ? 'bg-indigo-50 border-indigo-500' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}>
                    <Field
                      type="radio"
                      name="bookingType"
                      value="CUSTOM"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      onChange={() => {
                        setFieldValue('bookingType', 'CUSTOM');
                        setFieldValue('bookingSlot', null);
                        setAvailabilityChecked(false);
                      }}
                    />
                    <span className="ml-2 text-sm">Custom</span>
                  </label>
                </div>
                <ErrorMessage
                  name="bookingType"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {values.bookingType === 'HALF_DAY' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Booking Slot
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`flex items-center p-4 border rounded-md cursor-pointer ${
                      values.bookingSlot === 'FIRST_HALF' 
                        ? 'bg-indigo-50 border-indigo-500' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}>
                      <Field
                        type="radio"
                        name="bookingSlot"
                        value="FIRST_HALF"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        onChange={() => {
                          setFieldValue('bookingSlot', 'FIRST_HALF');
                          setAvailabilityChecked(false);
                        }}
                      />
                      <div className="ml-2">
                        <span className="text-sm font-medium">First Half</span>
                        <p className="text-xs text-gray-500">8:00 AM - 1:00 PM</p>
                      </div>
                    </label>
                    
                    <label className={`flex items-center p-4 border rounded-md cursor-pointer ${
                      values.bookingSlot === 'SECOND_HALF' 
                        ? 'bg-indigo-50 border-indigo-500' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}>
                      <Field
                        type="radio"
                        name="bookingSlot"
                        value="SECOND_HALF"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        onChange={() => {
                          setFieldValue('bookingSlot', 'SECOND_HALF');
                          setAvailabilityChecked(false);
                        }}
                      />
                      <div className="ml-2">
                        <span className="text-sm font-medium">Second Half</span>
                        <p className="text-xs text-gray-500">2:00 PM - 7:00 PM</p>
                      </div>
                    </label>
                  </div>
                  <ErrorMessage
                    name="bookingSlot"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              )}

              {values.bookingType === 'CUSTOM' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Field
                        type="time"
                        name="startTime"
                        id="startTime"
                        className={`w-full pl-10 px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.startTime && touched.startTime ? 'border-red-500' : 'border-gray-300'
                        }`}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setFieldValue('startTime', e.target.value);
                          setAvailabilityChecked(false);
                        }}
                      />
                    </div>
                    <ErrorMessage
                      name="startTime"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Field
                        type="time"
                        name="endTime"
                        id="endTime"
                        className={`w-full pl-10 px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.endTime && touched.endTime ? 'border-red-500' : 'border-gray-300'
                        }`}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setFieldValue('endTime', e.target.value);
                          setAvailabilityChecked(false);
                        }}
                      />
                    </div>
                    <ErrorMessage
                      name="endTime"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                </div>
              )}

              {availabilityChecked && (
                <div className={`p-4 rounded-md ${isAvailable ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {isAvailable ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${isAvailable ? 'text-green-800' : 'text-red-800'}`}>
                        {isAvailable ? 'Available!' : 'Not Available'}
                      </h3>
                      <div className={`mt-2 text-sm ${isAvailable ? 'text-green-700' : 'text-red-700'}`}>
                        <p>
                          {isAvailable 
                            ? 'This time slot is available for booking.' 
                            : 'This time slot is not available. Please select a different time or date.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => handleCheckAvailability(values)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={!isValid || checkingAvailability || isLoading}
                >
                  {checkingAvailability ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-700 mr-2"></div>
                      Checking...
                    </div>
                  ) : (
                    'Check Availability'
                  )}
                </button>
                
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  disabled={!isValid || isLoading || (availabilityChecked && !isAvailable)}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Booking'
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default BookingForm;