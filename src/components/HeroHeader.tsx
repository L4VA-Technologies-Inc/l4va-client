import React from 'react';

export const HeroHeader: React.FC = () => (
  <>
    <div className="font-russo">
      <h1
        className="
          uppercase leading-tight text-2xl sm:text-3xl lg:text-6xl xl:text-7xl tracking-wide lg:tracking-wider
          bg-gradient-to-r from-[#FF842C] to-[#FFD012] bg-clip-text text-transparent
        "
      >
        Dream big
      </h1>
      <p className="uppercase leading-tight block text-lg sm:text-2xl lg:text-5xl xl:text-6xl tracking-wide lg:tracking-wider">
        Tokenize Bigger
      </p>
    </div>
    <p className=" text-base sm:text-lg lg:text-2xl uppercase text-dark-100 font-bold tracking-wide lg:tracking-wider">
      Creator Driven Asset Tokenization Protocol
    </p>
  </>
);
