
import React from 'react';
import { Ionicons } from '@expo/vector-icons';


const GOLD = '#FFD700'; 

export default function DiamondIcon({
  name,
  size = 22,
  color = GOLD, // Now GOLD is correctly referenced
  style,
}) {
  return (
    <Ionicons
      name={name}
      size={size}
      color={color}
      style={style}
    />
  );
}
