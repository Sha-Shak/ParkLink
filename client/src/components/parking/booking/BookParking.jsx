/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import {
  Text,
  Image,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Select,
  Checkbox,
} from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';

export default function BookParking() {
  const location = useLocation();
  const parkingInfo = location.state?.parkingInfo;
  const minDate = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(minDate);
  const [fromTime, setFromTime] = useState('');
  const noAvailableTimeSlots = useRef(false);
  const [toTime, setToTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showEndDate, setShowEndDate] = useState(false);
  useEffect(() => {
    const fromHour = parseInt(fromTime.split(':')[0]);
    const nextHour = (fromHour + 1) % 24;
    const nextHourString = `${nextHour < 10 ? '0' : ''}${nextHour}:00`;

    if (nextHour <= parseInt(parkingInfo.toTime.split(':')[0])) {
      setToTime(nextHourString);
    } else {
      setToTime('');
    }
  }, [fromTime, parkingInfo.toTime]);
  const handleSubmit = (e) => {
    e.preventDefault();
    const bookingInfo = {
      selectedDate,
      fromTime,
      toTime,
      ...(showEndDate && { endDate }),
    };
    console.log(bookingInfo);
  };
  const toggleShowEndDate = () => {
    setShowEndDate(!showEndDate);
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;

    if (new Date(newEndDate) > new Date(selectedDate)) {
      setEndDate(newEndDate);
    } else {
      alert('End date must be greater than the start date');
    }
  };
  const convertTo12Hour = (time) => {
    let hour = parseInt(time.split(':')[0]);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:00 ${suffix}`;
  };
  const generateTimeOptions = (
    startTime,
    endTime,
    disablePast,
    fromTimeValue
  ) => {
    const options = [];
    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);
    const fromHour = fromTimeValue
      ? parseInt(fromTimeValue.split(':')[0])
      : null;

    const currentDate = new Date();
    const currentHour = currentDate.getHours();

    let availableTimeSlots = 0;

    for (let i = start; i <= end; i++) {
      if (fromHour && i <= fromHour) continue;
      const isDisabled =
        disablePast && selectedDate === minDate && i <= currentHour;
      const displayTime = convertTo12Hour(`${i}:00`);
      if (isDisabled) {
        options.push(
          <option key={i} value={`${i}:00`} disabled>
            {displayTime}
          </option>
        );
      } else {
        options.push(
          <option key={i} value={`${i}:00`}>
            {displayTime}
          </option>
        );
        availableTimeSlots++;
      }
    }

    noAvailableTimeSlots.current = availableTimeSlots === 0;

    return options;
  };
  useEffect(() => {
    noAvailableTimeSlots.current = false;
    generateTimeOptions(parkingInfo.fromTime, parkingInfo.toTime, true);
  }, [selectedDate]);

  return (
    <VStack spacing={4}>
      <Image src={parkingInfo.images[0]} />
      <Text>{parkingInfo.location.area}</Text>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Date</FormLabel>
            <Input
              type='date'
              value={selectedDate}
              min={minDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <Checkbox isChecked={showEndDate} onChange={toggleShowEndDate}>
              More than 1 day
            </Checkbox>
          </FormControl>
          {showEndDate && (
            <FormControl isRequired>
              <FormLabel>End Date</FormLabel>
              <Input
                type='date'
                value={endDate}
                min={selectedDate}
                onChange={handleEndDateChange}
              />
            </FormControl>
          )}
          <HStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>From</FormLabel>
              <Select
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                placeholder='Start Time'>
                {generateTimeOptions(
                  parkingInfo.fromTime,
                  parkingInfo.toTime,
                  true
                )}
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>To</FormLabel>
              <Select
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
                placeholder='End Time'>
                {generateTimeOptions(
                  parkingInfo.fromTime,
                  parkingInfo.toTime,
                  true,
                  fromTime
                )}
              </Select>
            </FormControl>
          </HStack>
          {noAvailableTimeSlots.current && (
            <Text color='red.500' mt={2}>
              All time slots for today are unavailable.
            </Text>
          )}
          <Button
            type='submit'
            colorScheme='purple'
            isDisabled={noAvailableTimeSlots.current}>
            Book Parking
          </Button>
        </VStack>
      </form>
    </VStack>
  );
}
