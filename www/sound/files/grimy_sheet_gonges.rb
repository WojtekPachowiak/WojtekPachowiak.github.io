set_volume! 10.0


gongi_loop1 = "C:/Users/48501/Desktop/Wojtek/music/galop_gongi_loop1.wav"
gongi_loop2 = "C:/Users/48501/Desktop/Wojtek/music/galop_gongi_loop2.wav"

live_loop :setter do
  set :melody_loop, rrand_i(0,1)
  sleep 3
end

live_loop :a do
  with_fx :gverb do
    loop do
      r = rrand(1.5,2.0)
      if one_in(2)
        set :phase, 0.3
        sample gongi_loop1,  rate: 0.5
      else
        set :phase, 0.4
        sample gongi_loop2
      end
      
      if one_in(15)
        10.times do
          sample :drum_bass_hard, finish: 0.1, amp: 0.1
          sleep 0.05
        end
      end
      
      if one_in(15)
        6.times do
          sample :perc_impact1, finish: 0.1, amp: 0.1, rate: -1
          sleep 0.1
        end
      end
      
      sleep r
    end
  end
end

live_loop :b do
  with_fx :compressor do
    loop do
      sample :loop_amen, rate: get[:phase] , amp: get[:melody_loop] * 0.3, start: 0.5, finish: 1
      sleep 1
    end
  end
end


comment do
  live_loop :foo do
    use_synth :mod_beep
    with_fx :hpf, mix: 0.9 do
      with_fx :gverb do
        loop do
          s = rrand(1,1.5)
          play :G5, amp: 0.7
          sleep s
          play :Cs5, amp: 0.7
          sleep s
        end
      end
    end
  end
end

comment do
  live_loop :foo do
    use_synth :mod_beep
    with_fx :hpf, mix: 0.9 do
      with_fx :gverb do
        loop do
          s = rrand(1,1.5)
          play :G5, amp: 0.7
          sleep s
          play :Cs5, amp: 0.7
          sleep s
        end
      end
    end
  end
end