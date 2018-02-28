def Filelock(lockname, options = {}, &block)
  puts "Opening file without filelock"
  File.open(lockname, File::RDWR|File::CREAT, 0644) do |file|
    Timeout::timeout(options.fetch(:timeout, 60), Filelock::ExecTimeout) { yield file }
  end
end
