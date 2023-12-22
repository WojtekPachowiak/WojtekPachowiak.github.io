set_volume! 5.0

live_loop :crush do
  with_fx :bitcrusher do
    loop do
      r = rrand(0.4,1.0)
      s = rrand(-0.1,0.1)
      samp = :glitch_bass_g
      samp2 = :bass_dnb_f
      use_sample_defaults amp: 1, sustain: 0.5 ,release: 0.5, rate: 0.9
      with_fx :pitch_shift, pitch: r do
        sample samp
        sample samp2
        sleep 1.6
        sample samp
        sample samp2
        sleep 0.8 + s
        sample samp
        sample samp2
        sleep 0.75
        sample samp
        sample samp2
        sleep 1.8 +s
      end
    end
  end
end


live_loop :rev_bells do
  with_fx :compressor do
    with_fx :lpf do
      loop do
        sample :perc_bell, rate: rrand(-1.5,-0.1), amp: 0.2
        sleep rrand(0.1, 2)
      end
    end
  end
end


live_loop :synth do
  use_synth :bass_highend
  loop do
    s = rrand(3,5)
    n = choose([30,45,50]) - 8
    play n, sustain: s, release: 0, amp: 0.1
    
    sleep s
  end
end

nigts_sampl_haha = "C:/Users/48501/Desktop/Wojtek/music/nights_reala-02.wav"
nigts_sampl_thereisnonights = "C:/Users/48501/Desktop/Wojtek/music/nights_reala-03.wav"
nigts_sampl_oof = "C:/Users/48501/Desktop/Wojtek/music/nights_reala-04.wav"
nigts_sampl_nights = "C:/Users/48501/Desktop/Wojtek/music/nights_reala-06.wav"
nigts_sampl_kurafit = "C:/Users/48501/Desktop/Wojtek/music/nights_reala-07.wav"

live_loop :voice do
  loop do
    sample nigts_sampl_kurafit, amp: 20, rate: choose([1.5,-1.5, 0.8]), release: 0.3
    sleep rrand(1,3)
  end
end


live_loop :hats do
  loop do
    sample :hat_bdu, amp: 0.2, rate: (range 0.5, 0.01,rrand(0.003,0.009)).mirror.tick
    sleep 0.2
    
  end
end