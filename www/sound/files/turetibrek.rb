set_volume! 1.5

with_fx :distortion, mix: 0.8 do
  
  nigts_sampl_thereisnonights = "C:/Users/48501/Desktop/Wojtek/music/nights_reala-03.wav"
  
  live_loop :voice do
    with_fx :gverb, mix: 0.2 do
      loop do
        slen = sample_duration(nigts_sampl_thereisnonights)
        f = choose([0.5,0.2,0.3])
        r = rrand(0.5, 0.7)
        
        if one_in(2) then
          r = r * -1
        end
        
        if one_in(2) then
          
          sample nigts_sampl_thereisnonights, rate: r, finish: f , amp: 7
        end
        sleep 1.3
      end
    end
  end
  
  
  
  live_loop :drums do
    with_fx :krush do
      loop do
        sample :elec_hollow_kick, amp: 3
        sleep 1
        sample :drum_snare_soft, rate: 0.9, amp: 1
        if one_in(5) then
          sleep 0.48
          sample :drum_cymbal_closed, rate: 0.7, amp: 1
          sleep 0.5
        else
          sleep 1
        end
      end
    end
  end
  
  
  define :play_synth do |pitch|
    use_synth :blade
    play pitch, amp: 1.5
    use_synth :prophet
    play pitch, amp: 0.5
    use_synth :gnoise
    play pitch, amp: 0.1
  end
  
  
  live_loop :synth do
    use_synth_defaults release: 5, attack: 2, attack_level: 0.5, sustain_level: 0.5, res: 0
    with_fx :tremolo, mix: 0.9 do
      with_fx :reverb, mix: 0.3 do
        loop do
          if one_in(7) then
            set :on_ambience, 9
            ch = choose([70,75,80])
            play_synth ch + rrand(-2,2)
            sleep 2
            play_synth ch + rrand(-2,2)
            sleep 1
            play_synth ch - 6 + rrand(-2,2)
            sleep 3
          end
          sleep 1
        end
      end
    end
  end
  
  
  
  /live_loop :ambience do
    set :on_ambience, 0
    use_synth :tb303
    use_synth_defaults wave: 1, pulse_width: 0.2
    with_fx :compressor do
      s = play 40, amp_slide: 3, amp: 0, sustain: 999, attack: 0, release: 0
      loop do
        control s, amp: get[:on_ambience], res: rrand(0,1), note: 20
        sleep 0.2
      end
    end
  end/
  
  define :play_trkt do |n|
    for i in range(1,n,1)
      sample :elec_lo_snare
      sleep rrand(0.4,0.8)
    end
    
  end
  
  live_loop :puk do
    sampl = :elec_snare
    set :on_ambience, 9
    use_sample_defaults amp: 0.1
    with_fx :echo do
      loop do
        if get[:on_ambience] > 0 then
          set :on_ambience, get[:on_ambience] - 1
        else
          if one_in(2) then
            play_trkt rrand_i(1,5)
            
          end
        end
        sleep 1
        
        
        
      end
    end
    
  end
  
  /loop do
    set :on_ambience, 0
    sleep 3
    set :on_ambience, 2
    sleep 3
  end/
  
end
