(let ((phi (lambda (x1 x2 x3 x4)
             (and (or x1 (or (not x2) (not x3)))
                  (and (or (not x2) (not x3))
                  (or x4 x2))))))
  (let ((try (lambda (f)
               (or (f #t) (f #f)))))
    (let ((sat-solve-4 (lambda (p)
                         (try (lambda (n1)
                                (try (lambda (n2)
                                       (try (lambda (n3)
                                              (try (lambda (n4)
                                                     (p n1 n2 n3 n4))))))))))))
      (sat-solve-4 phi))))