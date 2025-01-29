import { Twitter, Share2 } from 'lucide-react';

export const VaultCard = ({
  title,
  description,
  progress,
  raised,
  goal,
  tvl,
  access,
  baseAllo,
}) => (
  <div className="max-w-md rounded-xl bg-slate-900 overflow-hidden">
    {/* Hero Image */}
    <div className="h-48">
      <img
        alt={title}
        className="h-full w-full object-cover"
        src="/assets/space-man.png"
      />
    </div>

    {/* Content Section */}
    <div className="p-6">
      {/* Icon and Text */}
      <div className="flex gap-4 mb-6">
        <img
          alt={`${title} icon`}
          className="h-16 w-16 rounded-xl"
          src="/assets/vault-logo.png"
        />
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-slate-400">{description}</p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-white">
          <span className="font-bold">Total Raised: <span className="text-yellow-500">{progress}%</span></span>
          <span className="text-yellow-500">${raised.toLocaleString()} / ${goal.toLocaleString()}</span>
        </div>
        <div className="h-3 rounded-full bg-slate-800/50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-yellow-950 via-yellow-500 to-yellow-400"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-slate-400">TVL</p>
          <p className="text-xl font-bold text-white">{tvl}</p>
        </div>
        <div className="border-x border-slate-800">
          <p className="text-slate-400">Access</p>
          <p className="text-xl font-bold text-white">{access}</p>
        </div>
        <div>
          <p className="text-slate-400">Base allo</p>
          <p className="text-xl font-bold text-white">{baseAllo}</p>
        </div>
      </div>

      {/* Social Links */}
      <div className="flex gap-3">
        <button className="rounded-full bg-slate-800 p-2 hover:bg-slate-700">
          <Twitter className="h-5 w-5 text-slate-400" />
        </button>
        <button className="rounded-full bg-slate-800 p-2 hover:bg-slate-700">
          <Share2 className="h-5 w-5 text-slate-400" />
        </button>
      </div>
    </div>
  </div>
);
